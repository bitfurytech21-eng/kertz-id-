// Polyfill for Node.js < 20.12.0 where node:util does not export styleText
const util = require('node:util');

if (typeof util.styleText !== 'function') {
  util.styleText = function styleText(format, text) {
    if (text === undefined || text === null) return '';
    return String(text);
  };
}

if (typeof util.formatWithOptions !== 'function') {
  util.formatWithOptions = function formatWithOptions(inspectOptions, f, ...args) {
    return util.format(f, ...args);
  };
}
