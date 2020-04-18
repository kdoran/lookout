const React = require('react')
const { Link } = require('react-router-dom')
const {ErrorDisplay, Pagination, Loading} = require('../components')
require('./list-container.css')

const limit = 500

class ListContainer extends React.Component {
  constructor () {
    super()
    this.state = {
      rows: [],
      loaded: false
    }
  }

  componentDidMount () {
    this.load()
  }

  componetWillUpdate (previousProps) {
    if (previousProps.entityName !== this.props.entityName) {
      this.load()
    }
  }

  load = async () => {
    const {api, entityName} = this.props
    try {
      const rows = await api.list({limit})
      // TODO: count
      const total = (rows.length < limit)
        ? rows.length
        : await api.count()

      this.setState({rows, total, loaded: true})
    } catch (error) {
      console.log(error)
      this.setState({error})
    }
  }

  render () {
    const {entityName, couch} = this.props
    // const {searchParams: {offset = 0}, entityName} = this.props
    const {rows, error, loaded, total} = this.state

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
      ? <Loading message={entityName}/>
      : (
        <div>
          <div className='controls'>
            {PaginationComponent}
            <Link to={`/${couch}/example-entities/${entityName}/create`}>add {entityName}</Link>
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
                  <td><Link to={`/${couch}/${entityName}/view/${row.id}`}>{row.id}</Link></td>
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

module.exports = {ListContainer}
