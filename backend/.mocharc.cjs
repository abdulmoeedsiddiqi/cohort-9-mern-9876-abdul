process.env.TS_NODE_PROJECT = 'tsconfig.json';

module.exports = {
  require: 'ts-node/register',
  extension: ['ts'],
  spec: 'test/**/*.spec.ts',
  timeout: 5000,
};
