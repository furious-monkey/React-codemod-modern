const fromJs = require("./fromJS");
const get = require("./get");
const getIn = require("./getIn");
const listOf = require("./listOf");
const list = require("./list");
const map = require("./map");
const mapMutations = require("./mapMutations");
const toArray = require("./toArray");
const toJS = require("./toJS");
const { resolve } = require("path");

const transforms = [
  fromJs,
  get,
  getIn,
  listOf,
  list,
  map,
  mapMutations,
  toArray,
  toJS,
];

module.exports = function (file, api, options) {
  let src = file.source;
  transforms.forEach((transform) => {
    if (typeof src === "undefined") {
      return;
    }

    try {
      const nextSrc = transform({ ...file, source: src }, api, options);

      if (nextSrc) {
        src = nextSrc;
      }
    } catch (e) {
      console.log(
        `Error in tranforming ${file.path} with transform "${transform.displayName}"`
      );
      console.log(src);
      console.log(e.stack);
    }
  });
  return src;
};

module.exports.parser = "babylon";
// module.exports.parserConfig = resolve(__dirname, "../parserConfig.json");
// module.exports.extensions = ["js", "ts", "tsx"];
