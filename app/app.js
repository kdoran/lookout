import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { HashRouter as Router, Route, Switch } from 'react-router-dom'
// import manycouch from '@fielded/manycouch'

import SetupCouchContainer from './containers/SetupCouchContainer'
import DatabasesContainer from './containers/DatabasesContainer'
import DocsContainer from './containers/DocsContainer'
import DocContainer from './containers/DocContainer'
import ConfigContainer from './containers/ConfigContainer'
import EditDocContainer from './containers/EditDocContainer'
import QueryContainer from './containers/QueryContainer'
import Nav from './components/Nav'
import Login from './components/Login'
import Loading from './components/Loading'
import withParams from './containers/withParams'
import cache from './utils/cache'
import { parseUrl } from './utils/utils'
import fetcher from 'utils/fetcher'

import 'app-classes.css'
import 'app-tags.css'

const Databases = withParams(DatabasesContainer)
const LIMIT = 100

class UserRoutes extends Component {
  constructor (props) {
    super(props)
    this.state = {
      authenticated: !!cache.userCtx.name,
      loading: true,
      couchUrl: parseUrl(props.match.params.couch),
      dbs: null
    }
  }

  async componentDidMount () {
    const { couchUrl } = this.state
    const { userCtx } = await fetcher.checkSession(couchUrl)
    if (userCtx.name || userCtx.roles.length) {
      this.onAuthenticated(userCtx)
    }

    const dbs = await fetcher.get(`${couchUrl}_all_dbs`, { limit: LIMIT })
    this.setState({ loading: false, dbs })
  }

  onAuthenticated = (userCtx) => {
    Object.assign(cache.userCtx, userCtx)
    this.setState({ authenticated: true })
  }

  render () {
    const { authenticated, loading, couchUrl, dbs } = this.state
    if (loading) {
      return <Loading />
    }
    if (!authenticated) {
      return <Login couchUrl={couchUrl} onAuthenticated={this.onAuthenticated} />
    } else {
      return (
        <div>
          <div className='page'>
            <Switch>
              <Route path='/:couch/:dbName/:docId/editing' component={withParams(EditDocContainer)} />
              <Route exact path='/:couch/:dbName/query' component={withParams(QueryContainer)} />
              <Route exact path='/:couch/_node/couchdb@localhost/_config' component={withParams(ConfigContainer)} />
              <Route exact path='/:couch/_node/nonode@nohost/_config' component={withParams(ConfigContainer)} />
              <Route path='/:couch/:dbName/query/:queryId/:queryString' component={withParams(QueryContainer)} />
              <Route path='/:couch/:dbName/query/:queryId' component={withParams(QueryContainer)} />
              <Route path='/:couch/:dbName/:docId/:rev/' component={withParams(DocContainer)} />
              <Route path='/:couch/:dbName/:docId' component={withParams(DocContainer)} />
              <Route path='/:couch/:dbName' component={withParams(DocsContainer)} />
              <Route path='/:couch/' component={props => <Databases {...props} dbs={dbs} />} />
            </Switch>
          </div>
          <Route path='/:couch/:dbName?/:docId?' render={props => (<Nav {...props} dbs={dbs} userCtx={cache.userCtx} />)} />
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
