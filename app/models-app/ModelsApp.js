const React = require('react')
const { Link } = require('react-router-dom')
const { Loading } = require('./../components')
const {Route, Switch} = require('react-router-dom')
const DynamicModelsApi = require('./dynamic-models-api')

const ListModelsComponent = require('./ListModelsComponent')
const ViewModelContainer = require('./ViewModelContainer')

const ListDocsContainer = require('./ListDocsContainer')
const ViewDocContainer = require('./ViewDocContainer')

class ModelsApp extends React.Component {
  state = {loaded: false, models: []}

  async componentDidMount () {
    this.api = new DynamicModelsApi()
    const models = await this.api.list()
    this.setState({models, loaded: true})
  }

  render () {
    const {couch, match: {params: {modelType}}} = this.props
    const {models, loaded} = this.state
    console.log(modelType)

    if (!loaded) return <Loading message='models... ' />


    const docRoute = window.location.href.includes('/docs/')
    const routeProps = {
      couch,
      modelType,
      api: (docRoute && modelType) ? this.api.getDynamicApi(modelType) : this.api
    }

    return (
      <Switch>
        <Route
          exact
          path='/:couch/models/:id'
          render={props => (<ViewModelContainer {...props} {...routeProps} />)}
        />
        <Route
          exact
          path='/:couch/models'
          render={props => (<ListModelsComponent urlPrefix={`/${couch}/models`} models={models} />)}
        />
        <Route
          exact
          path='/:couch/models/:modelType/docs/'
          render={props => (<ListDocsContainer {...props} {...routeProps} />)}
        />
        <Route
          exact
          path='/:couch/models/:modelType/docs/:docId'
          render={props => (<ViewDocContainer {...props} {...routeProps} />)}
        />
      </Switch>
    )
  }
}

module.exports = ModelsApp
