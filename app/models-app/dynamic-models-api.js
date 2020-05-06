const {Model, PouchDB, PouchRelationsAdapter} = require('../../api')

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
    // json schema: can i have any property name, but define the property's values?
    // manyPropNamesOfAnyKind: {hardCodedProperty: anyValue}
    //   "relations": {
    //   "category": {
    //     "modelName": "category",
    //     "type": "one"
    //   }
    // },
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
    const adapter = new PouchRelationsAdapter(dynamicModelSchema, db, user)
    super(dynamicModelSchema, adapter, user)
    this.predefinedModels = models.map(model => ({name: model.name, noEdit: true, id: model.name}))
    this.apis = models
      .reduce((acc, model) => {
        acc[model.name] = model
        return acc
      }, {})
  }

  async setup () {
    const models = await this.list()
    await Promise.all(
      models.map(async model => {
        const dynamicModel = await this.get(model.name)
        this.apis[model.name] = this.createDynamicApi(dynamicModel)
      })
    )
  }

  async getDynamicApi (modelType, databaseName) {
    if (!this.apis[modelType]) {
      throw new Error('api not found')
    }

    // TODO: this needs a re-work
    if (databaseName) {
      const db = new PouchDB(databaseName)
      Object.values(this.apis).forEach(model => {
        model.adapter.pouchDB = db
      })
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
      relations: [
        // {relationPropName: {modelName, type: '{one,arrayDecorator,objectDecorator}'}},
        // e.g. {address: {modelName: 'address', type: 'one'}}
        // means this model now has addressID on default, and withRelations: true gets `address: {...}`
      ],
      schema: {
        type: 'object',
        properties: {
          name: {
            type: 'string'
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

  createDynamicApi ({name, schema, relations}) {
    const adapter = new PouchRelationsAdapter(
      {...schema, name},
      this.adapter.pouchDB,
      this.user,
      relations
    )
    adapter.parent = this.apis
    return new Model({...schema, name}, adapter, this.user)
  }
}

module.exports = DynamicModel
