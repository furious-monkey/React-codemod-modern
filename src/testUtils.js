const jscodeshift = require("jscodeshift");

function removePadding(text) {
  const output = text.split("\n");
  const padding = output.length
    ? output.reduce((min, line) => {
        const match = /^(\s*)(\S)/.exec(line);
        if (!match || match[1].length > min) {
          return min;
        }

        return match[1].length;
      }, 9999)
    : 0;
  return output
    .map((line) => (line.length > padding ? line.substr(padding) : line))
    .join("\n")
    .trim();
}

function testTransformer(transform, input, output) {
  const actual = transform(
    {
      source: input,
    },
    { jscodeshift }
  ).replace(/\r\n/g, "\n");
  expect(actual).toEqual(output);
}

module.exports = { testTransformer };
