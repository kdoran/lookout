const {SchemaInterface} = require('./schema-interface')

class EntityApi extends SchemaInterface {
  constructor ({
    schema, adapter, user, relations = {}, description = ''
  }) {
    if (typeof user !== 'object' || !user.name) {
      throw new Error('EntityApi usage: user object with name is requred')
    }
    if (!adapter) {
      throw new Error('EntityApi usage: adapter is required')
    }

    super(schema)

    this.adapter = adapter
    this.name = schema.name
    this.relations = relations
    this.description = description
    // done in schema interface
    // this.schema = schema
    this.user = user
  }

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
}

module.exports = {EntityApi}
