ModelApi
  - implements common methods
  - has a single data access adapter
  - has a schema that rejects on create/update
  - extended for model-specific domain logic (custom functions)
  - can be used on default without modification

AdapterApi
  - this is an interface extended that has the same methods as ModelApi
  - it defaults to the model's schema but can have different schema (location)

Why only one adapter in ModelApi? What about "smart" adapters that need two+ different data sources?

(strange that js-data had a "defaultAdapter" but no other way to change adapters externally...)

I think for these (pretty common) use cases, instead of trying to have the default
ModelApi + pouch Adapter Api, you'd create a custom adapter that can do stuff.

e.g. orders needs a single 'fetch' endpoint, so

```js
OrdersDataAdapter extends PouchDBAdapter {
  constructor () {
    super()
    this.fetchAdapter = new FetchAdapter()
  }
  list () {
    return this.fetchAdapter()
  }
}
```

(e.g. fetch + pouch, or localPouch + remotePouch)

to point out:
- adapter expected to return `id`
- adapter can use json schema if it wants
- pouch adapter definitely uses json schema


# todos:
- model api has schema but not sure how to use it yet
- common interface for Model & Adapter
