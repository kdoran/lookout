const React = require('react')
const { Link } = require('react-router-dom')
const {Route, Switch} = require('react-router-dom')
const {ListContainer} = require('./ListContainer')

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
              render={props => (<ListContainer api={this.api[entityName]} />)}
            />
          </Switch>
        )}
      </div>
    )
  }
}

module.exports = {ExampleEntities}
