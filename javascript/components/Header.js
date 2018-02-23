import React from 'react'
import {Link} from 'react-router-dom'

export default class MenuContainer extends React.Component {
  render () {
    return (
      <div>
        <h1>Aloha.</h1>
        <Link to='/shipments'>All Shipments</Link>
        &nbsp;| <Link to='/sync'>Sync Testing</Link>
        &nbsp;| <Link to='/filter'>ID filter endpoint</Link>
        &nbsp;| <Link to='/integrated-data'>Integrated data</Link>
      </div>
    )
  }
}
