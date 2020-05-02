const SchemaInterface = require('./schema-interface')

class Model extends SchemaInterface {
  constructor (schema, adapter, user) {
    super(schema)

    if (!adapter) {
      throw new Error('Model usage: data adapter param is required')
    }

    this.adapter = adapter
    this.name = schema.name
    this.user = user
  }

  // TODO: positional artuments
  // TODO: validate entities returned by adapter & soft fail on schema problems.
  // console.error them for monitoring tool
  async list (...params) {
    return this.adapter.list(...params)
  }

  async get (...params) {
    return this.adapter.get(...params)
  }

  async create (...params) {
    return this.adapter.create(...params)
  }

  async update (...params) {
    return this.adapter.update(...params)
  }

  async createMany (...params) {
    return this.adapter.createMany(...params)
  }

  async updateMany (...params) {
    return this.adapter.updateMany(...params)
  }

  async remove (...params) {
    return this.adapter.remove(...params)
  }

  async find (...params) {
    return this.adapter.find(...params)
  }

  async findOne (...params) {
    return this.adapter.findOne(...params)
  }

  async count () {
    return this.adapter.count()
  }

  async destroyMany (...params) {
    return this.adapter.destroyMany(...params)
  }

  async getByIds (...params) {
    return this.adapter.getByIds(...params)
  }

  createTemplate (...params) {
    return this.adapter.createTemplate(...params)
  }
}

module.exports = Model
