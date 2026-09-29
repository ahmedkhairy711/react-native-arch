module.exports = function (api) {
  // `api.env` also keys Babel's cache on the env, so dev/prod never share transforms.
  const isProd = api.env('production');

  return {
    presets: ['babel-preset-expo'],
    // Strip console.* from release bundles (logs, curl dumps, leaked data). console.error stays for crash tooling.
    plugins: isProd ? [['transform-remove-console', { exclude: ['error'] }]] : [],
  };
};
