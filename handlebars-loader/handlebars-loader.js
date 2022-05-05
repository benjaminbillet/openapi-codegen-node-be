const Handlebars = require('handlebars');

module.exports = function (src) {
  return `module.exports = ${Handlebars.precompile(src)};`;
};
