const React = require('react')
const sortBy = require('lodash/sortBy')
const {parseUrl} = require('../utils')

class SelectCouchContainer extends React.Component {
  state = {
    error: null,
    inputUrl: '',
    loading: false,
    couchLinks: []
  }

  async componentDidMount () {
    const couchLinks = await this.props.api.couchLink.list()
    this.setState({couchLinks: sortBy(couchLinks, 'url')})
  }

  tryACouch = async (inputUrl) => {
    inputUrl = parseUrl(inputUrl)
    this.setState({inputUrl, loading: true})

    // is the couch reachable? (using session because '/' is sometimes nginxed
    // to a non-couch resource)
    try {
      // instantiating api here & in the main app
      // is weird, but trying to do it in the app
      // ran into problems in passing router props around
      this.props.api.setCouchServer(inputUrl)
      await this.props.api.couchServer.getCurrentUser()
      this.props.history.push(inputUrl.split('//')[1])
    } catch (error) {
      this.setState({ error: error.toString(), loading: false })
      console.error(error)
    }
  }

  onSubmit = event => {
    event.preventDefault()
    let { inputUrl } = this.state
    this.tryACouch(inputUrl)
  }

  onCouchClick = inputUrl => {
    this.tryACouch(inputUrl)
  }

  render () {
    const { inputUrl, couchLinks, error, loading } = this.state

    return (
      <form onSubmit={this.onSubmit}>
        <h1>CouchDB Lookout: Select Couch Server</h1>
        <section>
          <label>
            Couch Url:
            <input
              type='text'
              autoFocus
              value={inputUrl}
              onChange={e => { this.setState({ inputUrl: e.target.value }) }}
            />
            {error && <div className='error'>
              Couch error: {error} {error.includes('Failed to fetch') && (<span>
                is the couch server reachable? <a target='_blank' href={inputUrl}>{inputUrl}</a> is CORS enabled?  <a target='_blank' href={inputUrl + '_utils'}>{inputUrl}_utils</a>
              </span>)}
            </div>}
          </label>
          <div>
            Recent Couches:
            <br /><br />
            {couchLinks.map(({url}) => (
              <div key={url}>
                &nbsp; <a href='#' onClick={(e) => { e.preventDefault(); this.onCouchClick(url) }}>
                  {url}
                </a>
                <br /><br />
              </div>
            ))}
          </div>
        </section>
        <button
          disabled={loading}
          type='submit'
        >
          {loading ? ' Loading...' : 'Submit'}
        </button>
        <a href='https://github.com/kdoran/lookout'>Lookout on GitHub</a>
      </form>
    )
  }
}

module.exports = {SelectCouchContainer}
