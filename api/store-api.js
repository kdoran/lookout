const {EntityApi} = require('./entity-api')

// TODO: throw if same name registered twice
class StoreApi {
  constructor (entities = [], DefaultAdapterClass) {
    this.entities = []
    for (let i = 0; i < entities.length; i++) {
      const entityApi = getEntityApi(entities[i], DefaultAdapterClass)
      this[entityApi.name] = entityApi
      this.entities.push(entityApi)
    }
  }
}

function getEntityApi (params, DefaultAdapterClass) {
  if (params instanceof EntityApi) {
    return params
  }

  const {
    name,
    description,
    schema,
    AdapterClass = DefaultAdapterClass
  } = params

  if (!AdapterClass) {
    throw new Error(`
      StoreApi usage: pass a list of instantiated adapters or objects with an {AdapterClass}
    `)
  }

  const adapter = new AdapterClass({name, schema})
  return new EntityApi({name, schema, description, adapter})
}

module.exports = {StoreApi}
