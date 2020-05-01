const React = require('react')
const { Link } = require('react-router-dom')
const {Route, Switch} = require('react-router-dom')

const ViewModelDefinitionContainer = require('./ViewModelDefinitionContainer')
const ListDocsContainer = require('./ListDocsContainer')
const ViewDocContainer = require('./ViewDocContainer')

const ModelsAppApi = require('./models-app-api')

class ModelsApp extends React.Component {
  state = {
    models: []
  }

  async componentDidMount () {
    this.api = new ModelsAppApi()
    const models = await this.api.lookoutModels.list()
    this.setState({models})
  }

  render () {
    const { couch } = this.props
    const {modelType} = this.props.match.params
    const {models} = this.state
    const routeProps = {
      couch,
      modelType,
      api: this.api ? this.api[modelType] : null
    }
    return (
      <div>
        <h2>Models</h2>
        <Link to={`/${couch}/models/definition`}>create model definition</Link>
        {models.map(model => {
          if (model.name === modelType) {
            return <span key={model.name}>{model.name} </span>
          }
          return <Link key={model.name} to={`/${couch}/models/${model.name}`}>
            {model.name}
          </Link>
        })}
        {modelType && this.api && (
          <Switch>
            <Route
              exact
              path='/:couch/models/definition'
              render={props => (<ViewModelDefinitionContainer {...props} {...routeProps} />)}
            />
            <Route
              exact
              path='/:couch/models/definition/:modelType?'
              render={props => (<ViewModelDefinitionContainer {...props} {...routeProps} />)}
            />
            <Route
              exact
              path='/:couch/models/:modelType/'
              render={props => (<ListDocsContainer {...routeProps} />)}
            />
            <Route
              exact
              path='/:couch/models/:modelType/new'
              render={props => (<ViewDocContainer {...props} {...routeProps} />)}
            />
          </Switch>
        )}
      </div>
    )
  }
}

module.exports = ModelsApp
