const { getDefaultConfig } = require('expo/metro-config');

module.exports = (async () => {
  const defaultConfig = await getDefaultConfig(__dirname);
  const { resolver: { assetExts, sourceExts } } = defaultConfig;

  return {
    ...defaultConfig,
    resolver: {
      ...defaultConfig.resolver,
      assetExts: [...assetExts, 'db', 'mp3'], // Add any additional asset extensions you need
      sourceExts: [...sourceExts, 'mjs'], // Add 'mjs' to sourceExts
    },
  };
})();
