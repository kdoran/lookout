const test = require('../../smalltest')
const {PouchRelationsAdapter, PouchDB} = require('../../../api')

const db = new PouchDB('integration-test-relations')

// TODO: test that required or not on relations still works as expected
const shipmentSchema = {
  name: 'shipment',
  type: 'object',
  properties: {
    date: {type: 'string', format: 'date-time'},
    sourceId: {type: 'string'},
    destinationId: {type: 'string'},
    transactions: {type: 'array'},
    items: {type: 'object'}
  }
}

const shipmentRelations = {
  'source': {modelName: 'location', type: 'one'},
  'destination': {modelName: 'location', type: 'one'},
  'transactions': {modelName: 'item', type: 'arrayDecorator'},
  'items': {modelName: 'item', type: 'objectDecorator'}
}

const api = {
  location: new PouchRelationsAdapter({
    name: 'location',
    type: 'object',
    properties: {name: {type: 'string'}}
  }, db),
  item: new PouchRelationsAdapter({
    name: 'item',
    type: 'object',
    properties: {name: {type: 'string'}}
  }, db),
  shipment: new PouchRelationsAdapter(shipmentSchema, db, null, shipmentRelations)
}

api.shipment.parent = api

test('pouch adapter: one:many relations', async t => {
  const a = await api.location.create({name: 'a'})
  const b = await api.location.create({name: 'b'})
  const shipment = await api.shipment.create({
    date: new Date().toJSON(), sourceId: a.id, destinationId: b.id
  })
  const without = await api.shipment.get(shipment.id)
  t.ok(
    without.sourceId,
    'sees the id'
  )
  t.notOk(
    without.source,
    'does not see relation'
  )
  const withRelations = await api.shipment.get(shipment.id, {withRelations: true})

  t.ok(
    withRelations.source.name === 'a' && withRelations.destination.name === 'b',
    'sees relations populated'
  )
  t.end()
})

test('pouch adapter: many to many decorator: array', async t => {
  const a = await api.location.create({name: 'a'})
  const b = await api.location.create({name: 'b'})
  const itemA = await api.item.create({name: 'a'})
  const itemB = await api.item.create({name: 'b'})
  const shipment = await api.shipment.create({
    date: new Date().toJSON(),
    sourceId: a.id,
    destinationId: b.id,
    transactions: [
      {itemId: itemA.id, quantity: 100},
      {itemId: itemB.id, quantity: 10}
    ]
  })
  const withRelations = await api.shipment.get(shipment.id, {withRelations: true})
  const [first, second] = withRelations.transactions.map(t => t.item)
  t.ok(first.name === 'a' && second.name === 'b', 'finds relations on array')
  t.end()
})

test('pouch adapter: many to many decorator: object', async t => {
  const a = await api.location.create({name: 'a'})
  const b = await api.location.create({name: 'b'})
  const itemA = await api.item.create({name: 'a'})
  const itemB = await api.item.create({name: 'b'})
  const shipment = await api.shipment.create({
    date: new Date().toJSON(),
    sourceId: a.id,
    destinationId: b.id,
    items: {
      [itemA.id]: {quantity: 1},
      [itemB.id]: {quantity: 50}
    }
  })
  const withRelations = await api.shipment.get(shipment.id, {withRelations: true})
  t.ok(
    withRelations.items[itemA.id].item.name === 'a' && withRelations.items[itemB.id].item.name === 'b',
    'finds many to many relation on object decorator'
  )
  t.end()
})

test('pouch adapter: teardown', async t => {
  return api.location.destroyDatabase()
})
