const React = require('react')
const {ErrorDisplay, Pagination, Loading} = require('../components')

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
      const total = (rows.length < limit)
        ? rows.length
        : await api.count(entityName)

      this.setState({rows, total, loaded: true})
    } catch (error) {
      console.log(error)
      this.setState({error})
    }
  }

  render () {
    console.log(this.props)
    const {entityName} = this.props
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

    const content = !loaded
      ? <Loading message={entityName}/>
      : (
        <div>
          {PaginationComponent}
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
                  <td><a href={`#/casfasdfasdfasdf/${entityName}/${row.id}`}>{row.id}</a></td>
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
          <a href="#/{asdfasdfasdf}/">all entities</a>
        </div>
      )

    return (
      <div class='page'>
        <button className='button-link float-right'>
          <a href='#/{adapter}/{entityName}/create'>add {entityName}</a>
        </button>
        <a href="#/{adapter}/">all entities</a>
        {content}
      </div>
    )
  }
}

module.exports = {ListContainer}
