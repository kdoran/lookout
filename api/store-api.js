const {EntityApi} = require('./entity-api')

class StoreApi {
  constructor (entities = []) {
    for (let i = 0; i < entities.length; i++) {
      const EntityConstructor = entities[0]
      const api = new EntityConstructor()
      this[api.name] = api
    }
  }
}

module.exports = {StoreApi}
