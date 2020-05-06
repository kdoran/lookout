const React = require('react')
const isEqual = require('lodash/isEqual')
const { Loading } = require('./../components')
const {Route, Switch} = require('react-router-dom')
const DynamicModelsApi = require('./dynamic-models-api')

const ListModelsContainer = require('./ListModelsContainer')
const ViewModelContainer = require('./ViewModelContainer')
const ListDocsContainer = require('./ListDocsContainer')
const ViewDocContainer = require('./ViewDocContainer')

class ModelsApp extends React.Component {
  state = {loaded: false}

  componentDidMount () {
    this.setup()
  }

  componentDidUpdate (previousProps) {
    if (isEqual(previousProps.user) !== isEqual(this.props.user) ||
      !isEqual(this.props.models, previousProps.models)) {
      this.setup()
    }
  }

  setup = async () => {
    this.api = new DynamicModelsApi(this.props.user, this.props.models)
    await this.api.setup()
    this.setState({loaded: true})
  }

  render () {
    const {loaded} = this.state
    const {couchUrl} = this.props

    if (!loaded) return <Loading />

    return (
      <Switch>
        <Route
          exact
          path='/:couch/models/on-db/:databaseName/:id'
          render={props => (<ViewModelContainer {...props} couchUrl={couchUrl} api={this.api} />)}
        />
        <Route
          exact
          path='/:couch/models/on-db/:databaseName/'
          render={props => (<ListModelsContainer {...props} couchUrl={couchUrl} api={this.api} />)}
        />
        <Route
          exact
          path='/:couch/models/on-db/:databaseName/:modelType/docs/'
          render={props => (<ListDocsContainer {...props} couchUrl={couchUrl} api={this.api} />)}
        />
        <Route
          exact
          path='/:couch/models/on-db/:databaseName/:modelType/docs/:id'
          render={props => (<ViewDocContainer {...props} couchUrl={couchUrl} api={this.api} />)}
        />

        <Route
          exact
          path='/:couch/models/:id'
          render={props => (<ViewModelContainer {...props} api={this.api} />)}
        />
        <Route
          exact
          path='/:couch/models'
          render={props => (<ListModelsContainer {...props} api={this.api} />)}
        />
        <Route
          exact
          path='/:couch/models/:modelType/docs/'
          render={props => (<ListDocsContainer {...props} api={this.api} />)}
        />
        <Route
          exact
          path='/:couch/models/:modelType/docs/:id'
          render={props => (<ViewDocContainer {...props} api={this.api} />)}
        />
      </Switch>
    )
  }
}

module.exports = ModelsApp
