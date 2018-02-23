import React from 'react'
import {getAllShipments, deleteDocs} from './../client'
import {Link} from 'react-router-dom'
import ShipmentHeader from './../components/ShipmentHeader'
import Moment from 'moment'

export default class ShipmentsContainer extends React.Component {
  state = { loading: true, shipments: [] }

  componentDidMount = () => {
    getAllShipments().then(shipments => {
      this.setState({ shipments, loading: false })
    })
  }

  // deleteAllShipments = () => {
  //   const {shipments} = this.state
  //   const docs = shipments.reduce((memo, shipment) => {
  //     return memo.concat(shipment.docs)
  //   }, [])
  //   this.setState({ loading: true }, () => {
  //     deleteDocs(docs).then(success => {
  //       getAllShipments().then(shipments => {
  //         this.setState({ shipments, loading: false })
  //       })
  //     })
  //   })
  // }

  render () {
    const { loading, shipments } = this.state
    return (
      <div className='shipments'>
        <h2>All Shipments</h2>
        {loading
        ?
          <div>Loading...</div>
        :
          <div>
            Shipments count: {shipments.length} <br />
            {/* <button onClick={this.deleteAllShipments}>Delete all shipments</button> */}
            <br />
            <table>
              <thead>
                <tr>
                  <th>date</th>
                  <th>details</th>
                  <th>last edit</th>
                  <th>total docs</th>
                  <th>doc counts</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map(({ id, date, origin, destination, no, docs, mostRecentTimestamp, docTypes }) => (
                  <tr key={id}>
                    <td>{Moment(date).isValid() ? Moment(date).format('DD MMM YY') : 'INVALID'}</td>
                    <td>
                      <Link to={`shipment/${id}`} >
                        {no} | {origin} | {destination}
                      </Link>
                    </td>
                    <td>{Moment(mostRecentTimestamp).fromNow()}</td>
                    <td>{docs.length}</td>
                    <td className='super-small'>
                      {Object.keys(docTypes).map((key, i) => (
                        `${docTypes[key]} ${key}. `
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!shipments.length && 'No shipments found.'}
          </div>
        }
      </div>
    )
  }
}
