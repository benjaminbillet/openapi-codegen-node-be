module.exports = {
  testEnvironment: 'node',
  roots: ['tests'],
  'moduleFileExtensions': ['ts', 'js', 'hbs'],
  'transform': {
    '\\.ts': 'babel-jest',
    '\\.js$': 'babel-jest',
    '\\.hbs$': '<rootDir>/handlebars-loader/jest-transformer.js'
  }
};
