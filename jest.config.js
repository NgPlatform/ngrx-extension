// 参考
// https://kakehashi-dev.hatenablog.com/entry/2022/07/06/090000

module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  // globalSetup: 'jest-preset-angular/global-setup',
  testMatch: ['<rootDir>/projects/ngrx-extension/src/lib/**/*.spec.ts'],
};
