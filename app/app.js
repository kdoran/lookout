import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import SetupCouchContainer from './containers/SetupCouchContainer'
import DatabasesContainer from './containers/DatabasesContainer'
import DocsContainer from './containers/DocsContainer'
import DocContainer from './containers/DocContainer'
import Header from './components/Header'
import Login from './components/Login'
import Loading from './components/Loading'
import cache from './cache'
import {getCouchUrl} from './utils/utils'
import fetcher from 'utils/fetcher'

import 'styles.css'

class UserRoutes extends Component {
  constructor (props) {
    super(props)
    this.state = {
      authenticated: !!cache.userCtx.name,
      loading: true,
      couchUrl: getCouchUrl(props.match).couchUrl
    }
  }

  async componentDidMount () {
    const { couchUrl } = this.state
    const { userCtx } = await fetcher.checkSession(couchUrl)
    if (userCtx.name || userCtx.roles.length) {
      this.onAuthenticated(userCtx)
    }
    this.setState({ loading: false })
  }

  onAuthenticated = (userCtx) => {
    Object.assign(cache.userCtx, userCtx)
    this.setState({ authenticated: true })
  }

  render () {
    const { authenticated, loading, couchUrl } = this.state
    if (loading) {
      return <Loading />
    }
    if (!authenticated) {
      return <Login couchUrl={couchUrl} onAuthenticated={this.onAuthenticated} />
    } else {
      return (
        <div>
          <Route path='/:couch/:dbName?/:docId?' render={props => (<Header {...props} userCtx={cache.userCtx} />)} />
          <Switch>
            <Route path='/:couch/:dbName/:docId' component={DocContainer} />
            <Route path='/:couch/:dbName' component={DocsContainer} />
            <Route path='/:couch/' component={DatabasesContainer} />
          </Switch>
        </div>
      )
    }
  }
}

class App extends Component {
  render () {
    return (
      <Router>
        <div>
          <Route exact path='/' component={SetupCouchContainer} />
          <Route path='/:couch/' component={UserRoutes} />
        </div>
      </Router>
    )
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('app')
)
