class StoreApi {
  constructor (entities = []) {
    for (let i = 0; i < entities.length; i++) {
      const EntityApi = entities[0]
      const api = new EntityApi()
      this[api.name] = api
    }
  }
}

module.exports = {StoreApi}
