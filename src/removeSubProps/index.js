const removeSubProps = require("./removeSubProps");

const transforms = [removeSubProps];

module.exports = function (file, api, options) {
  let src = file.source;
  transforms.forEach((transform) => {
    if (typeof src === "undefined") {
      return;
    }
    const nextSrc = transform({ ...file, source: src }, api, {
      ...options,
      quote: "single",
      lineTerminator: "\n",
    });

    if (nextSrc) {
      src = nextSrc;
    }
  });
  return src;
};
