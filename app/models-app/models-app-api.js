const {Model, PouchAdapter} = require('../../api')

const lookoutModelSchema = {
  name: 'lookoutModel',
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1
    },
    schema: {
      type: 'object'
    },
    relations: {
      type: 'object'
    }
  },
  required: ['name'],
  additionalProperties: false
}

class ModelsAppApi {
  constructor () {
    const db = new PouchDB('lookModel')
    // TODO: user
    const adapter = new PouchAdapter(lookoutModelSchema, db)
    this.lookoutModels = new Model(lookoutModelSchema, adapter)
  }
}

module.exports = ModelsAppApi
