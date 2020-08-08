const transformer = require("./mapMutations");
const { testTransformer } = require("../testUtils");

describe("mapMutations", () => {
  test("Removes set calls", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        const m = fromJS({}).set('a', false);
      `,
      `
        import { fromJS } from "immutable";

        const m = {
                ...fromJS({}),
                a: false
        };
      `
    );
  });

  test("Removes chained set calls", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        const m = fromJS({}).set('a', false).set('b', true).set('c', 1);
      `,
      `
        import { fromJS } from "immutable";

        const m = {
                ...fromJS({}),
                a: false,
                b: true,
                c: 1
        };
      `
    );
  });

  test("Removes setIn calls", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        const m = fromJS({}).setIn(['a'], false);
      `,
      `
        import { fromJS } from "immutable";

        const m = {
                ...fromJS({}),
                a: false
        };
      `
    );
  });

  test("Removes setIn calls with deep path", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        const m = fromJS({}).setIn(['a', 'b'], false);
      `,
      `
        import { fromJS } from "immutable";

        const m = {
                ...fromJS({}),

                a: {
                        ...fromJS({}).a,
                        b: false
                }
        };
      `
    );
  });

  test("Removes mix of chained set, setIn calls", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        const m = fromJS({})
          .set('a', 1)
          .setIn(['b', 'c'], 2)
          .set('d', 3)
          .setIn(['e'], 4)
          .setIn(['f', 'g', 'h'], 5)
          .setIn(['f', 'g', 'i'], 6)
      `,
      `
        import { fromJS } from "immutable";

        const m = {
          ...fromJS({}),
          a: 1,

          b: {
            ...fromJS({}).b,
            c: 2
          },

          d: 3,
          e: 4,

          f: {
            ...fromJS({}).f,

            g: {
              ...fromJS({})?.f.g,
              h: 5,
              i: 6
            }
          }
        }
      `
    );
  });
});
