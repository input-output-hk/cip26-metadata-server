import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    verbose: true,
    preset: 'ts-jest',
    globalSetup: './node_modules/@shelf/jest-mongodb/lib/setup.js',
    globalTeardown: './node_modules/@shelf/jest-mongodb/lib/teardown.js'
}

export default config;