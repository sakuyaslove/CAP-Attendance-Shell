from pathlib import Path

path = Path('README.md')
text = path.read_text()
text = text.replace('Populate each platform\'s Appfile and add signing credentials in CI before using these lanes.', "Populate each platform's Appfile and add signing credentials in CI before using these lanes.")
text = text.replace('1. **Exercise on real hardware** – Validate the CAP login + scanner flow on physical iOS and Android devices to confirm camera behaviour and haptics.', '1. **Exercise on real hardware** - Validate the CAP login and scanner flow on physical iOS and Android devices to confirm camera behavior and haptics.')
text = text.replace('2. **Wire up CI/CD** – Connect Fastlane lanes to your build pipeline, add signing assets, and gate merges on 
pm run typecheck plus the Jest suite.', '2. **Wire up CI/CD** - Connect Fastlane lanes to your build pipeline, add signing assets, and gate merges on 
pm run typecheck plus the Jest suite.')
text = text.replace('3. **Security hardening** – Evaluate certificate pinning, CSP enforcement, or navigation blocking if CAP publishes stricter guidance.', '3. **Security hardening** - Evaluate certificate pinning, CSP enforcement, or navigation blocking if CAP publishes stricter guidance.')
text = text.replace('4. **Optional telemetry** – If analytics are ever required, keep them opt-in and ensure no attendance data leaves the device.', '4. **Optional telemetry** - If analytics are ever required, keep them opt-in and ensure no attendance data leaves the device.')
text = text.replace('5. **Plan upgrades** – React Native 0.80.0 is the baseline; monitor the CLI template issue in 0.81+ and upgrade when upstream is ready.', '5. **Plan upgrades** - React Native 0.80.0 is the baseline; monitor the CLI template issue in 0.81+ and upgrade when upstream is ready.')
text = text.replace('VisionCamera’s advanced frame processors may require eact-native-worklets-core if custom ML worklets are added later.', "VisionCamera's advanced frame processors may require eact-native-worklets-core if custom ML worklets are added later.")
path.write_text(text)
