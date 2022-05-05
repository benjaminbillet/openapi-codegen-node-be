const loader = require('./handlebars-loader');

module.exports = {
  process: (src) => ({
    code: loader(src),
  }),
};
