import { JSDOM } from 'jsdom';
import {
  buildFillCommand,
  INJECT_BEFORE_LOAD,
} from '../src/injection/injectedScripts';

declare global {
  interface Window {
    __CapShell__?: {
      focusFirstTextInput: () => boolean;
      fillActiveElement: (value: string) => boolean;
      ping: () => string;
    };
  }
}

describe('CapShell injected helpers', () => {
  let dom: JSDOM;

  const bootstrapDom = (body: string) => {
    dom = new JSDOM(`<!DOCTYPE html><html><body>${body}</body></html>`, {
      url: 'https://www.capnhq.gov/',
    });
    (global as unknown as { window?: Window }).window =
      dom.window as unknown as Window;
    (global as unknown as { document?: Document }).document =
      dom.window.document;
    (global as unknown as { Event?: typeof Event }).Event = dom.window.Event;
    (
      global as unknown as { KeyboardEvent?: typeof KeyboardEvent }
    ).KeyboardEvent = dom.window.KeyboardEvent;
    dom.window.HTMLElement.prototype.getBoundingClientRect = () => ({
      width: 10,
      height: 10,
      top: 0,
      left: 0,
      right: 10,
      bottom: 10,
    });
    dom.window.eval(INJECT_BEFORE_LOAD);
  };

  afterEach(() => {
    dom?.window.close();
    delete (global as unknown as { window?: Window }).window;
    delete (global as unknown as { document?: Document }).document;
    delete (global as unknown as { Event?: typeof Event }).Event;
    delete (global as unknown as { KeyboardEvent?: typeof KeyboardEvent })
      .KeyboardEvent;
  });

  it('registers helper object on window', () => {
    bootstrapDom("<input id='test' type='text' />");
    expect(dom.window.__CapShell__).toBeDefined();
    expect(dom.window.__CapShell__?.ping()).toBe('pong');
  });

  it('fills the currently focused element and fires events', () => {
    bootstrapDom("<input id='test' type='text' />");
    const input = dom.window.document.getElementById(
      'test',
    ) as HTMLInputElement;
    const inputEvents: string[] = [];
    input.addEventListener('input', () => inputEvents.push('input'));
    input.addEventListener('change', () => inputEvents.push('change'));
    dom.window.document.activeElement = input as unknown as Element;

    const result = dom.window.__CapShell__?.fillActiveElement('123456');

    expect(result).toBe(true);
    expect(input.value).toBe('123456');
    expect(inputEvents).toEqual(['input', 'change']);
  });

  it('focuses the first input when none is active', () => {
    bootstrapDom(
      "<div><input id='first' type='text' /><input id='second' type='text' /></div>",
    );
    const firstInput = dom.window.document.getElementById(
      'first',
    ) as HTMLInputElement;

    dom.window.document.activeElement = dom.window.document.body as Element;
    const result = dom.window.__CapShell__?.fillActiveElement('ABC');

    expect(result).toBe(true);
    expect(firstInput.value).toBe('ABC');
  });

  it('builds a safe fill command', () => {
    bootstrapDom("<input id='test' type='text' />");
    const spy = jest.fn().mockReturnValue(true);
    if (dom.window.__CapShell__) {
      dom.window.__CapShell__.fillActiveElement = spy;
    }

    dom.window.eval(buildFillCommand('Line1\nLine2 $ 100%'));

    expect(spy).toHaveBeenCalledWith('Line1\nLine2 $ 100%');
  });
});
