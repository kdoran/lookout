const test = require('../../smalltest')
const {StoreApi, EntityApi, IndexedDBPouchAdapter} = require('../../../api')

const employeeSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
    }
  },
  required: ['name'],
  additionalProperties: false
}

test('store api: constructor with objects', async t => {
  const api = new StoreApi([
    {
      name: 'employee',
      description: 'an employee record',
      schema: employeeSchema,
      AdapterClass: IndexedDBPouchAdapter
    }
  ])
  t.ok(api.employee.list, 'works with params')
  t.end()
})

test('store api: constructor with default adapter', async t => {
  const api = new StoreApi(
    [{name: 'employee', schema: employeeSchema}],
    IndexedDBPouchAdapter
  )
  t.ok(api.employee.list, 'works with a default adapter for all entities')
  t.end()
})

test('store api: constructor with instantiated adapters', async t => {
  class EmployeeApi extends EntityApi {
    constructor () {
      const name = 'employee'
      const schema = employeeSchema
      const adapter = new IndexedDBPouchAdapter({name, schema})
      super({name, schema, adapter})
    }

    async customList () {
      const rows = await this.list()
      return rows.map(row => ({...row, specialProp: true}))
    }
  }

  const employee = new EmployeeApi()
  const api = new StoreApi([employee])
  const results = await api.employee.customList()
  t.ok(results, 'works with instantiated apater')
  t.end()
})
