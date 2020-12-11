import { Map, List } from "immutable";

const a = { a: true };
const b = { a: true };
const c = Map()
  .set("a", true)
  .setIn(["b", "c", "d"], true)
  .setIn(["b", "c", "e"], "hello");

const d = List([1, 2, 3]);
const e = List.of(1, 2, 3);
