# Experiments with codemod

## Remove immutable Map({ ... }) calls

```javascript
// in
import { Map } from 'immutable';

const m = Map({ a: true });
```

```javascript
// out
import { Map } from 'immutable';

const m = { a: true };
```

```javascript
// transform
export default function transformer(file, api) {
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.CallExpression, { callee: { name: 'Map' }, arguments: { '0': {type: 'ObjectExpression'}  } })
    .forEach(path => {
    console.log(path.node)
      j(path).replaceWith(
        path.node.arguments[0]
      );
    })
    .toSource();
}

```
