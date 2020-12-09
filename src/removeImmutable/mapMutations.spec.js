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

  test("Removes set calls with dynamic keys", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        const key = 'a';
        const m = fromJS({}).set(key, false);
      `,
      `
        import { fromJS } from "immutable";

        const key = 'a';
        const m = {
                ...fromJS({}),
                [key]: false
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

  test("Removes update calls", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        const m = fromJS({}).update('a', val => 2 * val );
      `,
      `
        import { fromJS } from "immutable";

        const m = {
                ...fromJS({}),
                a: (val => 2 * val)(fromJS({}).a)
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

  test("Removes setIn calls with dynamic keys", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        const key = 'a';
        const m = fromJS({}).setIn([key], false);
      `,
      `
        import { fromJS } from "immutable";

        const key = 'a';
        const m = {
                ...fromJS({}),
                [key]: false
        };
      `
    );
  });

  test("Removes updateIn calls", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        const m = fromJS({}).updateIn(['a'], val => 2 * val );
      `,
      `
        import { fromJS } from "immutable";

        const m = {
                ...fromJS({}),
                a: (val => 2 * val)(fromJS({}).a)
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

  test("Removes updateIn calls with deep path", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        const m = fromJS({}).updateIn(['a', 'b'], val => 2 * val );
      `,
      `
        import { fromJS } from "immutable";

        const m = {
                ...fromJS({}),

                a: {
                        ...fromJS({}).a,
                        b: (val => 2 * val)(fromJS({})?.a.b)
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
          .setIn(['e'], 4)
          .set('d', 3)
          .update('l', val => 2 * val)
          .setIn(['f', 'g', 'h'], 5)
          .setIn(['f', 'g', 'i'], 6)
          .updateIn(['f', 'g', 'k'], val => 3 * val)
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

          e: 4,
          d: 3,
          l: (val => 2 * val)(fromJS({}).l),

          f: {
            ...fromJS({}).f,

            g: {
              ...fromJS({})?.f.g,
              h: 5,
              i: 6,
              k: (val => 3 * val)(fromJS({})?.f?.g.k)
            }
          }
        }
      `
    );
  });

  test("Ignores files with no map mutations", () => {
    testTransformer(
      transformer,
      `
        import { fromJS } from "immutable";

        const m = fromJS({});
      `,
      `
        import { fromJS } from "immutable";

        const m = fromJS({});
      `
    );
  });
});
