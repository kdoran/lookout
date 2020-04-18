class EntityApi {
  constructor ({
    name, schema, adapter, relations = {}, description = ''
  }) {
    if (!name) {
      throw new Error('EntityApi usage: name is required')
    }
    if (!schema) {
      throw new Error('EntityApi usage: schema is required')
    }
    if (!adapter) {
      throw new Error('EntityApi usage: adapter is required')
    }

    this.adapter = adapter
    this.type = name
    this.name = name
    this.relations = relations
    this.description = description
    this.schema = schema
  }

  createTemplate () {
    return Object.keys(this.schema.properties)
      .reduce((acc, propetyName) => {
        acc[propetyName] = ''
        return acc
      }, {})
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
