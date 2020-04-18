const {PouchAdapter} = require('./pouch-adapter')

class EntityApi {
  constructor (name, schema, relations, DefaultAdapter = PouchAdapter) {
    if (!name) throw new Error('entity name required')
    if (!schema) throw new Error('entity schema required')

    this.name = name
    this.relations = relations
    // TODO: would it help to also/only let this be an instantiated instance?
    this.defaultAdapter = new DefaultAdapter(name, schema, relations)
  }

  validate (...params) {
    return this.defaultAdapter.validate(...params)
  }

  createTemplate (...params) {
    return this.defaultAdapter.createTemplate(...params)
  }

  list (...params) {
    return this.defaultAdapter.list(...params)
  }

  listByKeys (...params) {
    return this.defaultAdapter.list(...params)
  }

  find (...params) {
    return this.defaultAdapter.list(...params)
  }

  get (...params) {
    return this.defaultAdapter.get(...params)
  }

  create (...params) {
    return this.defaultAdapter.create(...params)
  }

  update (...params) {
    return this.defaultAdapter.update(...params)
  }

  createMany (...params) {
    return this.defaultAdapter.createMany(...params)
  }

  findOne (...params) {
    return this.defaultAdapter.findOne(...params)
  }

  updateMany (...params) {
    return this.defaultAdapter.updateMany(...params)
  }

  remove (...params) {
    return this.defaultAdapter.remove(...params)
  }
}

module.exports = {EntityApi}
