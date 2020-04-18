const {StoreApi, IndexedDBPouchAdapter} = require('../../api')

const item = {
  name: 'item',
  schema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
      }
    },
    required: ['name'],
    additionalProperties: false
  }
}

const location = {
  name: 'location',
  schema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
      }
    },
    required: ['name'],
    additionalProperties: false
  }
}

class ExampleApi extends StoreApi {
  constructor () {
    super([
      item,
      location
    ], IndexedDBPouchAdapter)
  }
}

module.exports = {ExampleApi}
