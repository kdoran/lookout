const keyBy = require('lodash/keyBy')
const flatten = require('lodash/flatten')
const cloneDeep = require('lodash/cloneDeep')
const get = require('lodash/get')
const PouchAdapter = require('./pouch-adapter')

const RELATIONSHIP_TYPES = [
  'one', 'arrayDecorator', 'objectDecorator'
]


/* relations = {
  'destination': {modelName: 'location', type: 'one'},
  'source': {modelName: 'location', type: 'one'},
  'transactions': {modelName: 'item', type: 'arrayDecorator'},
  'items': {modelName: 'item', type: 'objectDecorator'}
}*/
class PouchRelationsAdapter extends PouchAdapter {
  constructor (schema, pouchDB, user, relationDefinitions = []) {
    super(schema, pouchDB, user)
    this.relationDefinitions = Object.keys(relationDefinitions).map(key => {
      let {modelName, type} = relationDefinitions[key]
      if (!RELATIONSHIP_TYPES.includes(type)) {
        throw new Error(`Relationship type not recognized, ${type}`)
      }
      if (!modelName) {
        throw new Error('relation requires modelName')
      }

      return {
        modelName, type, key
      }
    })
  }

  async get (id, options = {}) {
    const model = await super.get(id, options)
    if (!options.withRelations || !Object.keys(this.relationDefinitions).length) {
      return model
    }

    const [withRelations] = await this.withRelations([model])
    return withRelations
  }

  async list (options = {}) {
    const models = await super.list(options)
    if (!options.withRelations || !Object.keys(this.relationDefinitions).length) {
      return models
    }

    return this.withRelations(models)
  }

  async withRelations (models) {
    const relationsByModel = this.getRelationIds(models)
    const relationModelsById = await this.getRelations(relationsByModel)
    return this.populateManyRelations(models, relationModelsById)
  }

  getRelationIds (models) {
    const idsByModel = {}
    this.relationDefinitions.forEach(definition => {
      const {modelName, key, type} = definition
      idsByModel[modelName] = idsByModel[modelName] || []

      if (type === 'one') {
        const ids = models.map(model => {
          const id = model[`${key}Id`]
          if (!id) {
            throw new Error(`relation ${key} not found on model ${model.id}`)
          }

          return id
        })
        idsByModel[modelName] = idsByModel[modelName].concat(ids)
        return
      }

      if (type === 'arrayDecorator') {
        const ids = idsByModel[modelName]
        models.forEach(model => {
          model[key].forEach(row => {
            const id = row[`${modelName}Id`]
            if (!id) {
              throw new Error(
                `Missing relation lookup in arrayDecorator,
                ${type}, ${property}, ${model.id}`
              )
            }
            ids.push(id)
          })
        })
        return
      }

      if (type === 'objectDecorator') {
        const ids = idsByModel[modelName]
        models.forEach(model => {
          Object.keys(model[key]).forEach(modelId => {
            ids.push(modelId)
          })
        })
        return
      }
    })
    return idsByModel
  }

  async getRelations (relationsByModel) {
    const results = await Promise.all(
      Object.keys(relationsByModel)
        .map(modelType => {
          const ids = relationsByModel[modelType]
          return this.parent[modelType].getByIds(ids)
        })
    )

    return keyBy(flatten(results), 'id')
  }

  populateManyRelations (models, relationModelsById) {
    return models.map(model => this.populateRelations(model, relationModelsById))
  }

  populateRelations (model, relationModelsById) {
    const result = cloneDeep(model)
    this.relationDefinitions.forEach(definition => {
    const {type, modelName, key} = definition
      if (type === 'one') {
        const relationModel = relationModelsById[model[`${key}Id`]]
        if (!relationModel) {
          throw new Error(`relation not found, ${key}, ${model[`${key}Id`]}`)
        }
        result[key] = relationModel
        return
      }

      if (type === 'arrayDecorator') {
        result[key].forEach((row, index) => {
          const relationModel = relationModelsById[row[`${modelName}Id`]]
          if (!relationModel) {
            throw new Error(`relation not found, ${key}, index: ${index}`)
          }
          row[modelName] = relationModel
        })
        return
      }

      if (type === 'objectDecorator') {
        Object.keys(result[key]).forEach(modelId => {
          const relationModel = relationModelsById[modelId]
          if (!relationModel) {
            throw new Error(`relation not found, ${key}, modelId: ${modelId}`)
          }
          result[key][modelId][modelName] = relationModel
        })
        return
      }
    })
    return result
  }
}

module.exports = PouchRelationsAdapter
