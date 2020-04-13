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
import { parseUrl, getParams } from './utils/utils'
import {RemoteCouchApi} from '../api/'

import 'app-classes.css'
import 'app-tags.css'

const LIMIT = 100

class OnDatabaseRoutes extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: true
    }
  }

  async componentDidMount () {
    this.setupDatabase(this.props.match.params.dbName)
  }

  componentDidUpdate (prevProps) {
    if (prevProps.match.params.dbName !== this.props.match.params.dbName) {
      this.setupDatabase(this.props.match.params.dbName)
    }
  }

  setupDatabase = async (dbName) => {
    this.currentDB = this.props.api.getPouchInstance(dbName)
    this.setState({loading: false})
  }

  render () {
    const { dbName } = this.props.match.params
    const {couchUrl} = this.props

    const commonProps = {
      dbUrl: `${couchUrl}${dbName}/`,
      dbName,
      db: this.currentDB,
      ...this.props
    }

    return (
      <div>
        <div className='page'>
          <Switch>
            <Route
              path='/:couch/:dbName/:docId/editing'
              render={props => (<EditDocContainer {...commonProps} {...props} />)}
            />
            <Route
              exact path='/:couch/:dbName/query'
              render={props => (<QueryContainer {...commonProps} {...props} />)}
            />
            <Route
              path='/:couch/:dbName/query/:queryId/:queryString'
              render={props => (<QueryContainer {...commonProps} {...props} />)}
            />
            <Route
              path='/:couch/:dbName/query/:queryId'
              render={props => (<QueryContainer {...commonProps} {...props} />)}
            />
            <Route
              path='/:couch/:dbName/:docId/:rev/'
              render={props => (<DocContainer {...commonProps} {...props} />)}
            />
            <Route
              path='/:couch/:dbName/:docId'
              render={props => (<DocContainer {...commonProps} {...props} />)}
            />
            <Route
              path='/:couch/:dbName'
              render={props => (<DocsContainer {...commonProps} {...props} />)}
            />
          </Switch>
        </div>
      </div>
    )
  }
}

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
    const { couch } = this.props.match.params
    const couchUrl = parseUrl(couch)
    const searchParams = getParams(this.props.location.search)

    const { user, loading } = this.state

    if (loading) return <Loading />

    if (!user) {
      return (
        <Login
          couchUrl={couchUrl}
          login={this.login}
        />
      )
    }

    const commonProps = {
      couch,
      couchUrl,
      searchParams,
      user,
      api: this.api
    }

    return (
      <div>
        <div className='page'>
          <Switch>
            <Route
              exact
              path='/:couch/_node/couchdb@localhost/_config/admins'
              render={props => (<AdminContainer {...props} {...commonProps} />)}
            />
            <Route
              exact
              path='/:couch/_node/nonode@nohost/_config/admins'
              render={props => (<AdminContainer {...props} {...commonProps} />)}
            />
            <Route
              exact
              path='/:couch/_node/couchdb@localhost/_config'
              render={props => (<ConfigContainer {...props} {...commonProps} />)}
            />
            <Route
              exact
              path='/:couch/_node/nonode@nohost/_config'
              render={props => (<ConfigContainer {...props} {...commonProps} />)}
            />
            <Route
              exact
              path='/:couch/'
              render={props => (<DatabasesContainer {...props} {...commonProps} />)}
            />
            <Route
              path='/:couch/:dbName'
              render={props => (<OnDatabaseRoutes {...props} {...commonProps} />)}
            />
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
