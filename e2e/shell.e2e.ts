import { by, device, element, expect, waitFor } from 'detox';

describe('CAP Attendance Shell', () => {
  const attendanceMockUrl = 'https://www.capnhq.gov/CAP.Attendance.Web/Mock';
  const launchConfig = {
    newInstance: true,
    permissions: { camera: 'YES' as const },
    url:
      'capshell://test?mode=mock&attendance=' +
      encodeURIComponent(attendanceMockUrl),
  };

  beforeEach(async () => {
    await device.launchApp(launchConfig);
  });

  it('navigates to the attendance portal from the header button', async () => {
    await expect(element(by.id('cap-shell-webview'))).toBeVisible();
    await waitFor(element(by.id('current-url-indicator')))
      .toHaveText('https://www.capnhq.gov/mock')
      .withTimeout(5000);

    await element(by.id('header-attendance')).tap();

    await waitFor(element(by.id('current-url-indicator')))
      .toHaveText(attendanceMockUrl)
      .withTimeout(5000);
  });

  it('injects the scanned value via clipboard fallback', async () => {
    await element(by.id('header-scan')).tap();
    await expect(element(by.id('scanner-cancel'))).toBeVisible();

    await device.setClipboard('CAP123456', 'plain-text');
    await element(by.id('scanner-paste')).tap();

    await waitFor(element(by.id('injection-debug')))
      .toHaveText('{"type":"fill","payload":"CAP123456"}')
      .withTimeout(4000);

    await expect(element(by.id('scanner-cancel'))).toBeNotVisible();
  });
});
