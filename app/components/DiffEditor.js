import React, { Component } from 'react'

import { diff as DiffEditor } from 'react-ace'

export default class extends Component {
  render () {
    const r1 = {
      '_id': 'product:bcg:manufacturer:amgen:batchNo:037G5022',
      '_rev': '3-f3545542389a1956ff15239c3188331a',
      'type': 'batch',
      'version': '1.0.0',
      'createdAt': '2018-05-30T15:56:26.029Z',
      'updatedAt': '2018-05-30T15:56:26.029Z',
      'createdBy': 'VAN backend service',
      'manufacturer': 'Amgen',
      'productId': 'product:bcg',
      'expiry': '2025-01-01T00:00:00.000Z'
    }

    const r2 = {
      '_id': 'product:bcg:manufacturer:amgen:batchNo:037G5022',
      '_rev': '3-f3545542389a1956ff15239c3188331a',
      'type': 'batch',
      'version': '1.5.0',
      'createdAt': '2018-05-30T15:56:26.029Z',
      'updatedAt': '2018-05-30T15:56:26.029Z',
      'createdBy': 'VAN backend service',
      'manufacturer': 'Amgen hygen',
      'productId': 'product:bcg',
      'expiry': '2025-01-01T00:00:00.000Z'
    }

    return <DiffEditor
      value={[JSON.stringify(r1).toString(), JSON.stringify(r2).toString()]}
      height='1000px'
      width='1000px'
      mode='text'
    />
  }
}