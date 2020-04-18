const React = require('react')
const { Link } = require('react-router-dom')
const {
  Loading,
  ErrorDisplay,
  Pagination,
  AllowEditButton,
  Breadcrumbs,
  DeleteDatabaseModal
} = require('components')

const {ExampleApi} = require('./example-api')

class ExampleEntities extends React.Component {
  state = {
    loaded: false,
    rows: null,
    error: null,
    showDeleteModal: false
  }

  componentDidMount () {
    this.api = new ExampleApi()
    this.load()
  }

  componentDidUpdate (prevProps) {
    const {dbUrl, searchParams: {offset}} = this.props
    if (prevProps.dbUrl !== dbUrl || prevProps.searchParams.offset !== offset) {
      this.load()
    }
  }

  load = async () => {
    // const { searchParams: { offset = 0 } } = this.props
    // this.setState({ loaded: false })
    //
    // try {
    //   const options = { skip: offset, limit: LIMIT, include_docs: false }
    //   const response = await this.props.pouchDB.allDocs(options)
    //   const rows = response.rows.map(row => {
    //     const link = (row.id.indexOf('/') === -1)
    //       ? row.id
    //       : encodeURIComponent(row.id)
    //     return { ...row, link }
    //   })
    //   this.setState({ response, rows, loaded: true })
    // } catch (error) {
    //   this.setState({ error, loaded: true })
    //   console.error(error)
    // }
  }

  render () {
    return (
      <div>
        <h2>Example Entities</h2>
      </div>
    )
  }
}

module.exports = {ExampleEntities}
