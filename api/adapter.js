const jjv = require('jjv')
const {
  baseProperties, baseRequired
} = require('./schema-utils')

class Adapter {
  constructor ({
    name, schema, relations = {}, description = ''
  }) {
    if (!name) throw new Error('PouchAdapter name is required')
    if (!schema) throw new Error('PouchAdapter schema is required')

    this.type = name
    this.name = name
    this.relations = relations
    this.description = description

    this.schema = schema
    this.schema.properties = Object.assign({}, baseProperties, schema.properties)
    this.schema.required = baseRequired.concat(schema.required || [])
    this.schema.properties.type.default = name

    this.schema.required = this.schema.required.concat(['type'])

    this.jjvEnv = jjv()
    this.jjvEnv.addSchema(this.name, this.schema)
  }

  validate (row) {
    return this.jjvEnv.validate(this.name, this.toRecord(row))
  }

  throwIfInvalid (row) {
    const validationErrors = this.validate(row)
    if (validationErrors) {
      const err = new Error()
      Object.assign(err, validationErrors)
      err.message = `Validation errors found ${row._id} ${JSON.stringify(validationErrors)}`
      throw err
    }
  }

  toRecord (row) {
    return row
  }

  createTemplate () {
    throw new Error('A class extending `Adapter` did not implement createTemplate')
  }

  async list () {
    throw new Error('A class extending `Adapter` did not implement list')
  }

  async get () {
    throw new Error('A class extending `Adapter` did not implement get')
  }

  async create () {
    throw new Error('A class extending `Adapter` did not implement create')
  }

  async update () {
    throw new Error('A class extending `Adapter` did not implement update')
  }

  async createMany () {
    throw new Error('A class extending `Adapter` did not implement createMany')
  }

  async updateMany () {
    throw new Error('A class extending `Adapter` did not implement updateMany')
  }

  async remove () {
    throw new Error('A class extending `Adapter` did not implement remove')
  }

  async find () {
    throw new Error('A class extending `Adapter` did not implement find')
  }

  async findOne () {
    throw new Error('A class extending `Adapter` did not implement findOne')
  }
}

module.exports = {Adapter}
