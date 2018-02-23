import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route } from 'react-router-dom'

import {checkAuth} from './client'

import ShipmentsContainer from './containers/ShipmentsContainer'
import ShipmentContainer from './containers/ShipmentContainer'
import SyncContainer from './containers/SyncContainer'
import LoginContainer from './containers/LoginContainer'
import TestIdFilterContainer from './containers/TestIdFilterContainer'
import IntegratedDataContainer from './containers/IntegratedDataContainer'
import DocContainer from './containers/DocContainer'
import Header from './components/Header'

require('./styles.less')

class App extends Component {

  componentDidMount() {
    // checkAuth().then(user => {
    //
    // })
  }


  render () {
    return (
      <Router>
        <div>
          <Header />
          <Route exact path='/' component={() => (null)} />
          <Route exact path='/shipments' component={ShipmentsContainer} />
          <Route exact path='/shipment/:snapshotId' component={ShipmentContainer} />
          <Route exact path='/login' component={LoginContainer} />
          <Route exact path='/sync' component={SyncContainer} />
          <Route exact path='/filter' component={TestIdFilterContainer} />
          <Route exact path='/integrated-data' component={IntegratedDataContainer} />
          <Route exact path='/doc/:id' component={DocContainer} />
        </div>
      </Router>
    )
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('app')
)
