import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    verbose: true,
    preset: 'ts-jest',
    globalSetup: './tests/integration/setup.ts',
    globalTeardown: './tests/integration/teardown.ts'
}

export default config;