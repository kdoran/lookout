const React = require('react')
const { Link } = require('react-router-dom')
const { ButtonLink, Loading, ErrorDisplay } = require('../components')

class ListModelsContainer extends React.Component {
  state = {models: [], loaded: false}

  async componentDidMount () {
    this.load()
  }

  load = async () => {
    const models = await this.props.api.list()
    this.setState({models, loaded: true})
  }


  render () {
    const {couch, databaseName} = this.props.match.params
    const {models, loaded, error} = this.state

    const maybeWithDB = databaseName
      ? `models/on-db/${databaseName}`
      : `models`
    const baseUrl = `/${couch}/${maybeWithDB}/`

    if (!loaded) return <Loading message='models... ' />

    if (error) return <ErrorDisplay error={error} />

    return (
      <div>
        <div className='controls'>
          <ButtonLink to={`${baseUrl}create`}>create model definition</ButtonLink>
        </div>
        <table>
          <thead>
            <tr>
              <th>View Docs</th>
              <th>createdAt</th>
              <th>createdBy</th>
              <th>updatedAt</th>
              <th>updatedBy</th>
              <th>edit</th>
            </tr>
          </thead>
          <tbody>
            {models.map(row => (
              <tr key={row.id}>
                <td><Link to={`${baseUrl}${row.name}/docs/`}>{row.name}</Link></td>
                <td>{row.createdAt}</td>
                <td>{row.createdBy}</td>
                <td>{row.updatedAt}</td>
                <td>{row.updatedBy}</td>
                <td>{row.noEdit ? null : (<Link to={`${baseUrl}${row.id}`}>edit definition</Link>)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
}

module.exports = ListModelsContainer
