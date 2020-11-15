const formatMessage = require("./formatMessage");
const formattedMessage = require("./formattedMessage");

const transforms = [formatMessage, formattedMessage];

module.exports = function (file, api, options) {
  let src = file.source;
  transforms.forEach((transform) => {
    if (typeof src === "undefined") {
      return;
    }
    const nextSrc = transform({ ...file, source: src }, api, options);

    if (nextSrc) {
      src = nextSrc;
    }
  });
  return src;
};
