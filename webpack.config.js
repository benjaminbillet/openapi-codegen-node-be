const path = require('path');

module.exports = {
  target: 'node',
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ['babel-loader',
          {
            loader: 'ts-loader',
            options: {
              configFile: path.resolve('tsconfig-package.json')
            }
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.hbs$/,
        use: [
          {
            loader: path.resolve('handlebars-loader/handlebars-loader.js'),
            options: {
              precompileOptions: {
                knownHelpersOnly: false,
              },
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.hbs'],
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'openapiCodegenNodeBE',
      type: 'umd',
      umdNamedDefine: true,
    },
  },
  devtool: 'source-map',
};
