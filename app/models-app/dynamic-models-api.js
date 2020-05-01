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

  async list (...props) {
    const results = await super.list(...props)
    results.forEach(result => {
      this.addDynamicApi(result)
    })
    return results
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

  addDynamicApi ({name, schema}) {
    const adapter = new PouchAdapter({...schema, name}, this.adapter.pouchDB)
    this.dynamicApis[name] = new Model({...schema, name}, adapter)
  }

  getDynamicApi (modelType) {
    if (!this.dynamicApis[modelType]) {
      throw new Error(`dynamic api not found, ${modelType}`, this.dynamicApis)
    }

    return this.dynamicApis[modelType]
  }
}

module.exports = DynamicModels
