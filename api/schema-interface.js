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
      err.message = `Validation errors found ${row.type} ${row.id} ${JSON.stringify(validationErrors)}`
      throw err
    }
  }

  getSchemaDefaults () {
    const ignoreList = ['_id', '_rev', '_deleted']
    return Object.keys(this.schema.properties)
      .reduce((acc, propName) => {
        if (ignoreList.includes(propName)) return acc
        acc[propName] = this.getFieldDefault(propName)
        return acc
      }, {})
  }

  // this could go wayyy further if really needed
  getFieldDefault (propName) {
    const {default: propDefault, type} = this.schema.properties[propName]

    if (typeof propDefault === 'function') {
      return propDefault(this)
    }

    if (propDefault !== undefined) {
      return propDefault
    }

    if (type === 'object') {
      return {}
    }

    if (type === 'boolean') {
      return false
    }

    if (type === 'string') {
      return ''
    }

    if (type === 'array') {
      return []
    }

    return 0
  }
}

module.exports = SchemaInterface
