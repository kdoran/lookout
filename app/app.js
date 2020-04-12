import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { HashRouter as Router, Route, Switch } from 'react-router-dom'

import SetupCouchContainer from './containers/SetupCouchContainer'
import DatabasesContainer from './containers/DatabasesContainer'
import DocsContainer from './containers/DocsContainer'
import DocContainer from './containers/DocContainer'
import ConfigContainer from './containers/ConfigContainer'
import AdminContainer from './containers/AdminContainer'
import EditDocContainer from './containers/EditDocContainer'
import QueryContainer from './containers/QueryContainer'
import Nav from './components/Nav'
import Login from './components/Login'
import Loading from './components/Loading'
import withParams from './containers/withParams'
import { parseUrl } from './utils/utils'
import fetcher from 'utils/fetcher'
import {RemoteCouchApi} from '../api/'

import 'app-classes.css'
import 'app-tags.css'

const LIMIT = 100

class CouchRoutes extends Component {
  constructor (props) {
    super(props)
    this.state = {
      user: null,
      loading: true
    }
  }

  async componentDidMount () {
    this.setupCouch(this.props.match.params.couch)
  }

  componentDidUpdate (prevProps) {
    if (prevProps.match.params.couch !== this.props.match.params.couch) {
      this.setupCouch(this.props.match.params.couch)
    }
  }

  login = (username, password) => {
    return this.api.login(username, password).then(user => {
      this.setState({user})
    })
  }

  setupCouch = async (couch) => {
    const couchUrl = parseUrl(couch)
    this.api = new RemoteCouchApi(couchUrl)
    const user = await this.api.getCurrentUser()
    this.setState({loading: false, user})
  }

  render () {
    const { user, loading } = this.state
    const couchUrl = parseUrl(this.props.match.params.couch)

    if (loading) return <Loading />

    if (!user) {
      return (
        <Login
          couchUrl={couchUrl}
          login={this.login}
        />
      )
    }

    return (
      <div>
        <div className='page'>
          <Switch>
            <Route path='/:couch/:dbName/:docId/editing' component={withParams(EditDocContainer, this.api, this.currentDB)} />
            <Route exact path='/:couch/:dbName/query' component={withParams(QueryContainer, this.api, this.currentDB)} />
            <Route exact path='/:couch/_node/couchdb@localhost/_config/admins' component={withParams(AdminContainer, this.api, this.currentDB)} />
            <Route exact path='/:couch/_node/nonode@nohost/_config/admins' component={withParams(AdminContainer, this.api, this.currentDB)} />
            <Route exact path='/:couch/_node/couchdb@localhost/_config' component={withParams(ConfigContainer, this.api, this.currentDB)} />
            <Route exact path='/:couch/_node/nonode@nohost/_config' component={withParams(ConfigContainer, this.api, this.currentDB)} />
            <Route path='/:couch/:dbName/query/:queryId/:queryString' component={withParams(QueryContainer, this.api, this.currentDB)} />
            <Route path='/:couch/:dbName/query/:queryId' component={withParams(QueryContainer, this.api, this.currentDB)} />
            <Route path='/:couch/:dbName/:docId/:rev/' component={withParams(DocContainer, this.api, this.currentDB)} />
            <Route path='/:couch/:dbName/:docId' component={withParams(DocContainer, this.api, this.currentDB)} />
            <Route path='/:couch/:dbName' component={withParams(DocsContainer, this.api, this.currentDB)} />
            <Route path='/:couch/' component={withParams(DatabasesContainer, this.api, this.currentDB)} />
          </Switch>
        </div>
        <Route
          path='/:couch/:dbName?/:docId?'
          render={props => (<Nav {...props} api={this.api} dbs={[]} user={user} />)}
        />
      </div>
    )
  }
}

class App extends Component {
  render () {
    return (
      <Router>
        <div>
          <Route exact path='/' component={SetupCouchContainer} />
          <Route path='/:couch/' component={CouchRoutes} />
        </div>
      </Router>
    )
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('app')
)
