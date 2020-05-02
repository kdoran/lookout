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
    const relationIdsByModel = this.getRelationIds(models)
    const relationModelsById = await this.getRelations(relationIdsByModel)
    return this.populateManyRelations(models, relationModelsById)
  }

  getRelationIds (models) {
    const idsByModel = {}
    this.relationDefinitions.forEach(definition => {
      const {modelName, key, type} = definition
      idsByModel[modelName] = idsByModel[modelName] || new Set()

      if (type === 'one') {
        models.map(model => {
          const id = model[`${key}Id`]
          if (!id) {
            throw new Error(`relation ${key} not found on model ${model.id}`)
          }

          idsByModel[modelName].add(id)
        })
        return
      }

      if (type === 'arrayDecorator') {
        models.forEach(model => {
          model[key].forEach(row => {
            const id = row[`${modelName}Id`]
            if (!id) {
              throw new Error(
                `Missing relation lookup in arrayDecorator,
                ${type}, ${property}, ${model.id}`
              )
            }
            idsByModel[modelName].add(id)
          })
        })
        return
      }

      if (type === 'objectDecorator') {
        models.forEach(model => {
          Object.keys(model[key]).forEach(modelId => {
            idsByModel[modelName].add(modelId)
          })
        })
        return
      }
    })
    const idsByModelAsArray = {}
    Object.keys(idsByModel)
      .forEach(modelName => {
        idsByModelAsArray[modelName] = Array.from(idsByModel[modelName])
      })

    return idsByModelAsArray
  }

  async getRelations (relationIdsByModel) {
    const results = await Promise.all(
      Object.keys(relationIdsByModel)
        .map(modelType => {
          const ids = relationIdsByModel[modelType]
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
