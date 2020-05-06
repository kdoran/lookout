const React = require('react')
const { Link } = require('react-router-dom')
const {ErrorDisplay, ButtonLink, Pagination, Loading} = require('../components')
require('./list-models-container.css')

const limit = 500

class ListDocsContainer extends React.Component {
  state = {
    rows: [],
    loaded: false
  }

  componentDidMount () {
    this.load()
  }

  componetWillUpdate (previousProps) {
    if (previousProps.match.params.modelType !== this.props.match.params.modelType) {
      this.load()
    }
  }

  load = async () => {
    const {couchUrl} = this.props
    const {databaseName, modelType} = this.props.match.params

    this.api = await this.props.api.getDynamicApi(modelType, `${couchUrl}${databaseName}`)

    try {
      const rows = await this.api.list({limit})
      const total = (rows.length < limit)
        ? rows.length
        : await this.api.count()

      this.setState({rows, total, loaded: true})
    } catch (error) {
      console.log(error)
      this.setState({error})
    }
  }

  render () {
    const {couch, modelType, databaseName} = this.props.match.params
    const {rows, error, loaded, total} = this.state

    const maybeWithDB = databaseName
      ? `models/on-db/${databaseName}`
      : `models`
    const baseUrl = `/${couch}/${maybeWithDB}/`

    if (error) {
      return <ErrorDisplay error={error} />
    }

    const PaginationComponent = (
      <Pagination
        total={total}
        displayed={rows.length}
        limit={limit}
        offset={0}
      />
    )

    return !loaded
      ? <Loading message={modelType} />
      : (
        <div>
          <Link to={`${baseUrl}`}>back</Link>
          {PaginationComponent}
          <div className='controls'>
            <ButtonLink to={`${baseUrl}${modelType}/docs/create`}>create {modelType}</ButtonLink>
          </div>
          <table>
            <thead>
              <tr>
                <th>id</th>
                <th>name</th>
                <th>createdAt</th>
                <th>createdBy</th>
                <th>updatedAt</th>
                <th>updatedBy</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id}>
                  <td><Link to={`${baseUrl}${modelType}/docs/${row.id}`}>{row.id}</Link></td>
                  <td>{row.name}</td>
                  <td>{row.createdAt}</td>
                  <td>{row.createdBy}</td>
                  <td>{row.updatedAt}</td>
                  <td>{row.updatedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {PaginationComponent}
        </div>
      )
  }
}

module.exports = ListDocsContainer
