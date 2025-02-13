module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    plugins: [
      'react-native-reanimated/plugin',
      './node_modules/react-native-worklets-core/plugin.js',
      ['inline-import', { extensions: ['.sql'] }],
      [
        'module-resolver',
        {
          alias: {
            'react-native-worklets/plugin': 'react-native-worklets-core/plugin',
          },
        },
      ],
    ],
  };
};
