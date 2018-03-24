import React from 'react'
import Moment from 'moment'
import {parseSnapshot} from './../utils/client'

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
