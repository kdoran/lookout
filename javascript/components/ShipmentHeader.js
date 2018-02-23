import React from 'react'
import Moment from 'moment'
import {parseSnapshot} from './../utils'

export default class ShipmentHeader extends React.Component {
  render () {
    const {date, origin, destination, shipmentNo} = parseSnapshot(this.props.snapshotId)
    return (
      <span>
        {Moment(date).format('MMM d YYYY')} | {origin} | {destination} | {shipmentNo}
      </span>
    )
  }
}
