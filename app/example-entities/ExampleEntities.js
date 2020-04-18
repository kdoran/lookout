const React = require('react')
const { Link } = require('react-router-dom')
const {Route, Switch} = require('react-router-dom')
const {ListContainer} = require('./ListContainer')
const {CreateUpdateContainer} = require('./CreateUpdateContainer')

const {ExampleApi} = require('./example-api')

class ExampleEntities extends React.Component {
  state = {
    entities: []
  }

  componentDidMount () {
    this.api = new ExampleApi()
    this.setState({entities: this.api.entities})
  }

  render () {
    const { couch } = this.props
    const {entityName} = this.props.match.params
    const {entities} = this.state
    const routeProps = {
      couch,
      entityName,
      api: this.api ? this.api[entityName] : null
    }
    return (
      <div>
        <h2>Example Entities</h2>
        {entities.map(entity => {
          if (entity.name === entityName) {
            return <span key={entity.name}>{entity.name} </span>
          }
          return <Link key={entity.name} to={`/${couch}/example-entities/${entity.name}`}>
            {entity.name}
          </Link>
        })}
        {entityName && this.api && (
          <Switch>
            <Route
              exact
              path='/:couch/example-entities/:entityName/'
              render={props => (<ListContainer {...routeProps} />)}
            />
            <Route
              exact
              path='/:couch/example-entities/:entityName/create/:entityId?'
              render={props => (<CreateUpdateContainer {...props} {...routeProps} />)}
            />
          </Switch>
        )}
      </div>
    )
  }
}

module.exports = {ExampleEntities}
