import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import SetupCouchContainer from './containers/SetupCouchContainer'
import TestContainer from './containers/TestContainer'
import Header from './components/Header'
import withCouch from './utils/withCouch'

import 'styles.css'

class App extends Component {
  render () {
    return (
      <Router>
        <div>
          <Route path='/:couchUrl/' render={({ match: {params} }) => (<Header {...params} />)} />
          <Switch>
            <Route exact path='/' component={SetupCouchContainer} />
            <Route path='/:couchUrl/' component={withCouch(TestContainer)} />
          </Switch>
        </div>
      </Router>
    )
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('app')
)
