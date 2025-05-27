import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
testMatch: ['**/?(*.)+(spec|test).ts']
};

export default config;
