import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import SetupCouchContainer from './containers/SetupCouchContainer'
import DatabasesContainer from './containers/DatabasesContainer'
import DocsContainer from './containers/DocsContainer'
import DocContainer from './containers/DocContainer'
import Header from './components/Header'
import withCouch from './utils/withCouch'

import 'styles.css'

const HeaderWithCouch = withCouch(Header)

class App extends Component {
  render () {
    return (
      <Router>
        <div>
          <Route path='/:couchUrl/' render={(props) => (<HeaderWithCouch {...props} />)} />
          <Switch>
            <Route path='/:couchUrl/:dbName/:docId' component={withCouch(DocContainer)} />
            <Route path='/:couchUrl/:dbName' component={withCouch(DocsContainer)} />
            <Route path='/:couchUrl/' component={withCouch(DatabasesContainer)} />
            <Route path='/' component={SetupCouchContainer} />
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
