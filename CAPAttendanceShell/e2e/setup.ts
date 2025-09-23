import detox from 'detox';
import adapter from 'detox/runners/jest/adapter';
import specReporter from 'detox/runners/jest/specReporter';
import assignReporter from 'detox/runners/jest/assignReporter';

jasmine.getEnv().addReporter(adapter);
jasmine.getEnv().addReporter(specReporter);
assignReporter(jasmine.getEnv());

beforeAll(async () => {
  await detox.init();
}, 300000);

beforeEach(async () => {
  await adapter.beforeEach();
});

afterAll(async () => {
  await adapter.afterAll();
  await detox.cleanup();
});

afterEach(async () => {
  await adapter.afterEach();
});
