const {Model, PouchAdapter} = require('../../api')

const dynamicModelSchema = {
  name: 'dynamicModel',
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1
    },
    // databaseName: {
    //   type: 'string',
    //   minLength: 1
    // },
    schema: {
      type: 'object'
    },
    // relations: {
    //   type: 'object'
    // }
  },
  required: ['name'],
  additionalProperties: false
}

class DynamicModels extends Model {
  constructor () {
    const db = new PouchDB('dynamicModel')
    // TODO: user
    const adapter = new PouchAdapter(dynamicModelSchema, db)
    super(dynamicModelSchema, adapter)
    this.dynamicApis = {}
  }

  async getDynamicApi (modelType) {
    if (!this.dynamicApis[modelType]) {
      const dynamicModel = await this.get(modelType)
      this.dynamicApis[modelType] = this.createDynamicApi(dynamicModel)
    }

    return this.dynamicApis[modelType]
  }

  async create (row) {
    const withId = {...row, id: row.name}
    return super.create(withId)
  }

  createTemplate () {
    return {
      name: '',
      schema: {
        type: 'object',
        properties: {}
      }
    }
  }
  // TODO: ace editor javascript mode wasn't working try upgrade
//   createTemplateAsString () {
//     return `{
//   databaseName: '',
//   name: '',
//   schema: {
//     name: '',
//     type: 'object',
//     properties: {
//       // name: {
//         // type: 'string',
//         // minLength: 1
//       //}
//     }
//   }
// }`
//   }

  createDynamicApi ({name, schema}) {
    const adapter = new PouchAdapter({...schema, name}, this.adapter.pouchDB)
    return new Model({...schema, name}, adapter)
  }
}

module.exports = DynamicModels
