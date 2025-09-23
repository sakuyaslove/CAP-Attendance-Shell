const INJECT_BEFORE_LOAD_SOURCE = `
(function () {
  if (window.__CapShell__) {
    return;
  }

  var EDITABLE_SELECTOR = [
    "input:not([type=hidden]):not([type=button]):not([type=submit]):not([disabled])",
    "textarea:not([disabled])",
    '[contenteditable=""]',
    '[contenteditable="true"]',
  ].join(",");

  var isEditable = function (el) {
    if (!el) {
      return false;
    }
    if (el.isContentEditable) {
      return true;
    }
    if (typeof el.matches === "function" && el.matches(EDITABLE_SELECTOR)) {
      return true;
    }
    return false;
  };

  var isVisible = function (el) {
    if (!el || !el.getBoundingClientRect) {
      return false;
    }
    var rect = el.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) {
      return false;
    }
    var style = window.getComputedStyle ? window.getComputedStyle(el) : null;
    if (!style) {
      return true;
    }
    return style.visibility !== "hidden" && style.display !== "none" && style.opacity !== "0";
  };

  var getEditableFromNode = function (node) {
    if (!node) {
      return null;
    }
    if (isEditable(node)) {
      return node;
    }
    if (node.shadowRoot && node.shadowRoot.activeElement) {
      return getEditableFromNode(node.shadowRoot.activeElement);
    }
    return null;
  };

  var findFirstEditableInDocument = function (doc) {
    try {
      var candidates = doc.querySelectorAll(EDITABLE_SELECTOR);
      for (var i = 0; i < candidates.length; i += 1) {
        var candidate = candidates[i];
        if (candidate && isVisible(candidate)) {
          return candidate;
        }
      }
    } catch (error) {
      return null;
    }

    var iframes = doc.querySelectorAll ? doc.querySelectorAll("iframe") : [];
    for (var j = 0; j < iframes.length; j += 1) {
      var iframe = iframes[j];
      try {
        var childDoc = iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document);
        if (childDoc) {
          var result = findFirstEditableInDocument(childDoc);
          if (result) {
            return result;
          }
        }
      } catch (err) {
        continue;
      }
    }

    return null;
  };

  var getFocusedEditable = function (doc) {
    var active = doc.activeElement || doc.body;
    if (active) {
      var focused = getEditableFromNode(active);
      if (focused) {
        return focused;
      }
      if (active.tagName === "IFRAME") {
        try {
          var iframeDoc = active.contentDocument || (active.contentWindow && active.contentWindow.document);
          if (iframeDoc) {
            var nested = getFocusedEditable(iframeDoc);
            if (nested) {
              return nested;
            }
          }
        } catch (error) {
          return null;
        }
      }
    }

    var iframes = doc.querySelectorAll ? doc.querySelectorAll("iframe") : [];
    for (var i = 0; i < iframes.length; i += 1) {
      var iframe = iframes[i];
      try {
        var contentDoc = iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document);
        if (contentDoc) {
          var frameFocused = getFocusedEditable(contentDoc);
          if (frameFocused) {
            return frameFocused;
          }
        }
      } catch (error) {
        continue;
      }
    }

    return null;
  };

  var focusFirstEditable = function () {
    var candidate = findFirstEditableInDocument(document);
    if (candidate) {
      try {
        candidate.focus();
      } catch (error) {
        return false;
      }
      return true;
    }
    return false;
  };

  var setElementValue = function (element, value) {
    if (!element) {
      return;
    }
    if (element.isContentEditable) {
      element.textContent = value;
    } else {
      var prototype = Object.getPrototypeOf(element);
      var descriptor = prototype && Object.getOwnPropertyDescriptor(prototype, "value");
      if (descriptor && descriptor.set) {
        descriptor.set.call(element, value);
      } else {
        element.value = value;
      }
    }

    var eventOptions = { bubbles: true, cancelable: true };
    element.dispatchEvent(new Event("input", eventOptions));
    element.dispatchEvent(new Event("change", eventOptions));
    element.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true, key: "Enter" }));
  };

  window.__CapShell__ = {
    focusFirstTextInput: function () {
      return focusFirstEditable();
    },
    fillActiveElement: function (value) {
      if (typeof value !== "string") {
        return false;
      }
      var active = getFocusedEditable(document);
      if (!active) {
        var focused = focusFirstEditable();
        if (!focused) {
          return false;
        }
        active = getFocusedEditable(document);
      }
      if (!active) {
        return false;
      }
      setElementValue(active, value);
      return true;
    },
    ping: function () {
      return "pong";
    },
  };
})();
true;
`;

export const INJECT_BEFORE_LOAD = INJECT_BEFORE_LOAD_SOURCE;

const escapeForTemplateLiteral = (input: string): string =>
  input
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$')
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n');

export const buildFillCommand = (value: string): string => {
  const escaped = escapeForTemplateLiteral(value);
  return `
    (function () {
      try {
        if (window.__CapShell__ && typeof window.__CapShell__.fillActiveElement === "function") {
          window.__CapShell__.fillActiveElement(\`${escaped}\`);
        }
      } catch (error) {
        console.warn("CapShell: failed to inject value", error);
      }
    })();
    true;
  `;
};
