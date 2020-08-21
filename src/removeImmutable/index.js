const fromJs = require("./fromJS");
const get = require("./get");
const getIn = require("./getIn");
const list = require("./list");
const map = require("./map");
const mapMutations = require("./mapMutations");
const toArray = require("./toArray");
const toJS = require("./toJS");

const transforms = [fromJs, get, getIn, list, map, mapMutations, toArray, toJS];

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
