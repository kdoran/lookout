const {Model, PouchDB, PouchAdapter} = require('../../api')

const dynamicModelSchema = {
  name: 'dynamicModel',
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1
    },
    // databaseName: {
    //   type: 'string'
    // },
    schema: {
      type: 'object'
    },
    relations: {
      type: 'object'
    }
  },
  required: ['name', 'schema'],
  additionalProperties: false
}

class DynamicModel extends Model {
  constructor (user, models = []) {
    const db = new PouchDB('dynamicModel')
    // TODO: user
    const adapter = new PouchAdapter(dynamicModelSchema, db)
    super(dynamicModelSchema, adapter, user)
    this.predefinedModels = models.map(model => ({name: model.name, noEdit: true, id: model.name}))
    this.apis = models
      .reduce((acc, model) => {
        acc[model.name] = model
        return acc
      }, {})
  }

  async getDynamicApi (modelType, databaseName) {
    if (!this.apis[modelType]) {
      const dynamicModel = await this.get(modelType)
      this.apis[modelType] = await this.createDynamicApi(dynamicModel)
    }

    // TODO: this needs a re-work
    if (databaseName) {
      this.apis[modelType].adapter.pouchDB = new PouchDB(databaseName)
    }

    return this.apis[modelType]
  }

  async create (row) {
    const withId = {...row, id: row.name}
    return super.create(withId)
  }

  async list () {
    const existing = await super.list()
    return this.predefinedModels.concat(existing)
  }

  createTemplate () {
    return {
      name: '',
      relations: {},
      schema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
          }
        }
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

  async createDynamicApi ({name, schema, relations}) {
    await Promise.all(
      Object.keys(relations.hasOne || {}).map(async key => {
        const name = relations.hasOne[key].type
        const relationDefinition = await this.get(name)
        relations.hasOne[key].schema = {...relationDefinition.schema, name}
      })
    )
    const adapter = new PouchAdapter({...schema, name}, this.adapter.pouchDB, this.user, relations)
    return new Model({...schema, name}, adapter, this.user)
  }
}

module.exports = DynamicModel
