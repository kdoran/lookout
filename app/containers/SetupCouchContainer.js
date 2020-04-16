const React = require('react')
const {RemoteCouchApi} = require('../../api/')
const {parseUrl, localStorager} = require('../utils')

class SetupCouchContainer extends React.Component {
  constructor () {
    super()
    let recentCouches = localStorager.getRecent('couchurls').sort()
    recentCouches = recentCouches.length ? recentCouches : ['http://localhost:5984/']
    this.state = {
      error: null,
      inputUrl: '',
      loading: false,
      recentCouches
    }
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
      const api = new RemoteCouchApi(inputUrl)
      await api.getCurrentUser()
      localStorager.saveRecent('couchurls', inputUrl)
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
    const { inputUrl, recentCouches, error, loading } = this.state

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
            {recentCouches.map(url => (
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

module.exports = {SetupCouchContainer}
