const {StoreApi, PouchAdapter} = require('../../api')

const itemSchema = {
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

class ExampleApi extends StoreApi {
  constructor () {
    super([{name: 'item', schema: itemSchema}])
  }
}

module.exports = {ExampleApi}
