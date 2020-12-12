const jscodeshift = require("jscodeshift");

function testTransformer(transform, input, output) {
  const actual = transform(
    {
      source: input,
    },
    { jscodeshift: jscodeshift.withParser("tsx") }
  ).replace(/\r\n/g, "\n");
  expect(actual).toEqual(output);
}

module.exports = { testTransformer };
