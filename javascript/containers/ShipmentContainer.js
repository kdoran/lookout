import React from 'react'
import {getShipmentDocs, deleteDocs} from './../client'
import ShipmentHeader from './../components/ShipmentHeader'
import {Link} from 'react-router-dom'

export default class ShipmentsContainer extends React.Component {
  state = { loading: true, docs: [], deleted: false }

  componentDidMount = () => {
    const {snapshotId} = this.props.match.params
    getShipmentDocs(snapshotId).then(docs => {
      this.setState({ docs, loading: false })
    })
  }

  deleteShipment = () => {
    const {snapshotId} = this.props.match.params
    this.setState({ loading: true, deleted: true })
    deleteDocs(this.state.docs).then(success => {
      getShipmentDocs(snapshotId).then(docs => {
        this.setState({ docs: docs, loading: false })
      })
    })
  }

  render () {
    const { loading, docs, deleted } = this.state
    const {snapshotId} = this.props.match.params
    return (
      <div className='shipments'>
        <h2><ShipmentHeader snapshotId={snapshotId} /></h2>
        {loading
        ?
          <div>Loading...</div>
        : docs.length
          ?
            <div>
              <button onClick={this.deleteShipment}>Delete all docs on this shipment</button>
              {docs.map(doc => (
                <div>
                  <Link to={`/doc/${doc._id}`}>{doc._id}</Link>
                  <pre>
                    {JSON.stringify(doc, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          : deleted ? `All shipment docs on snapshot were deleted.` : 'No docs found on this snapshot id'
        }
      </div>
    )
  }
}
