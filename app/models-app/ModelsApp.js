const React = require('react')
const { Loading } = require('./../components')
const {Route, Switch} = require('react-router-dom')
const DynamicModelsApi = require('./dynamic-models-api')

const ListModelsContainer = require('./ListModelsContainer')
const ViewModelContainer = require('./ViewModelContainer')
const ListDocsContainer = require('./ListDocsContainer')
const ViewDocContainer = require('./ViewDocContainer')

class ModelsApp extends React.Component {
  constructor () {
    super()
    this.api = new DynamicModelsApi()
  }

  render () {
    return (
      <Switch>
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
          path='/:couch/models/:modelType/docs/:docId'
          render={props => (<ViewDocContainer {...props}  api={this.api} />)}
        />
      </Switch>
    )
  }
}

module.exports = ModelsApp
