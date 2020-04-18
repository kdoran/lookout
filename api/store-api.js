const {Adapter} = require('./adapter')

class StoreApi {
  constructor (entities = []) {
    this.entities = []
    for (let i = 0; i < entities.length; i++) {
      const entity = getEntity(entities[i])
      this[entity.name] = entity
      this.entities.push(entity)
    }
  }
}

function getEntity (entity) {
  if (entity instanceof Adapter) {
    return entity
  }

  const {
    name,
    description,
    schema,
    AdapterClass
  } = entity

  if (!AdapterClass) {
    throw new Error(`
      StoreApi usage: pass a list of instantiated adapters or objects with an {AdapterClass}
    `)
  }

  return new AdapterClass({name, description, schema})
}

module.exports = {StoreApi}
