const React = require('react')
const { Component } = require('react')
const ReactDOM = require('react-dom')
const {HashRouter, Route, Switch} = require('react-router-dom')

const {RemoteCouchApi, lookoutApi} = require('./lookout-api')

const {SelectCouchContainer} = require('./containers/SelectCouchContainer')
const {DatabasesContainer} = require('./containers/DatabasesContainer')
const {DocsContainer} = require('./containers/DocsContainer')
const {DocContainer} = require('./containers/DocContainer')
const {ConfigContainer} = require('./containers/ConfigContainer')
const {AdminContainer} = require('./containers/AdminContainer')
const {EditDocContainer} = require('./containers/EditDocContainer')
const {QueryContainer} = require('./containers/QueryContainer')
const {ExampleEntities} = require('./example-entities/ExampleEntities')

const {Footer, Login, Loading} = require('./components')
const {parseUrl, getParams} = require('./utils')

require('app-classes.css')
require('app-tags.css')

// 1. App = if no couch in the URL, return SelectCouchContainer
// 2. CouchRoutes = routes for "we have couch URL but not a specific database."
// 3. OnDatabaseRoutes = we have a couch url and a specific datbase

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
    this.pouchDB = this.props.api.getPouchInstance(dbName)
    window.pouchDB = this.pouchDB
    console.log(`${dbName} available in console as window.pouchDB`)
    this.setState({loading: false})
  }

  render () {
    const { dbName } = this.props.match.params
    const {couchUrl} = this.props

    const commonProps = {
      dbUrl: `${couchUrl}${dbName}/`,
      dbName,
      pouchDB: this.pouchDB,
      ...this.props
    }

    if (!commonProps.pouchDB) return null

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

      this.saveLink(parseUrl(this.props.match.params.couch))
    })
  }

  setupCouch = async (couch) => {
    const {lookoutApi} = this.props
    const couchUrl = parseUrl(couch)
    this.api = new RemoteCouchApi(couchUrl)
    window.api = this.api
    console.log(
      `window.api.PouchDBConstructor couchUrl \nwindow.api.GenericPouchDB is Pouch constructor without prefix`
    )

    const user = await this.api.getCurrentUser()
    this.setState({loading: false, user})

    this.saveLink(couchUrl)
  }

  saveLink = async (couchUrl) => {
    const {lookoutApi} = this.props
    // save a local link doc for us to list in select couch container
    const localLink = await lookoutApi.couchLink.findOne({url: {'$eq': couchUrl}})
    if (!localLink) {
      await lookoutApi.couchLink.create({name: couchUrl, url: couchUrl})
    }
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
              path='/:couch/view-admins'
              render={props => (<AdminContainer {...props} {...commonProps} />)}
            />
            <Route
              exact
              path='/:couch/view-config'
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
              path='/:couch/example-entities/:entityName?/:method?'
              render={props => (<ExampleEntities {...props} {...commonProps} />)}
            />
            <Route
              path='/:couch/:dbName'
              render={props => (<OnDatabaseRoutes {...props} {...commonProps} />)}
            />
          </Switch>
        </div>
        <Route
          path='/:couch/:dbName?/:docId?'
          render={props => (<Footer {...props} api={this.api} dbs={[]} user={user} />)}
        />
      </div>
    )
  }
}

class App extends Component {
  render () {
    return (
      <HashRouter>
        <Switch>
          <Route
            exact
            path='/'
            render={props => (<SelectCouchContainer {...props} lookoutApi={lookoutApi} />)}
          />
          <Route
            path='/:couch/'
            render={props => (<CouchRoutes {...props} lookoutApi={lookoutApi} />)}
          />
        </Switch>
      </HashRouter>
    )
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('app')
)
