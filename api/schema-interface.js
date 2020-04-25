const jjv = require('jjv')

class SchemaInterface {
  constructor (schema) {
    if (typeof schema !== 'object' || !schema.properties || !schema.name) {
      throw new Error('SchemaInterface usage: schema object with {properties: {}, name} is required')
    }

    this.schema = schema
    this.jjvEnv = jjv()
    this.jjvEnv.addSchema(schema.name, this.schema)
  }

  validate (row) {
    return this.jjvEnv.validate(this.schema.name, row)
  }

  throwIfInvalid (row) {
    const validationErrors = this.validate(row)
    if (validationErrors) {
      const err = new Error()
      Object.assign(err, validationErrors)
      err.message = `Validation errors found ${row.id || row._id} ${JSON.stringify(validationErrors)}`
      throw err
    }
  }

  getSchemaDefaults () {
    return Object.keys(this.schema.properties)
      .reduce((acc, propName) => {
        acc[propName] = this.getFieldDefault(propName)
        return acc
      }, {})
  }

  // this could be a whole bag of games like "type number ? 0, type Object ? {} "
  // but not clear if it's worth the clutter
  getFieldDefault (propName) {
    const propDefault = this.schema.properties[propName].default
    if (!propDefault && propName !== '_id') {
      return ''
    }

    if (typeof propDefault === 'function') {
      return propDefault(this)
    }

    return propDefault
  }
}

module.exports = {SchemaInterface}
