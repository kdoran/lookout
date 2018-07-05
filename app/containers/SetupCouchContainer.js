import React from 'react'
import fetcher from 'utils/fetcher'
import localStorager from 'utils/localstorager'
import {parseUrl} from 'utils/utils'
import cache from '../utils/cache'

export default class extends React.Component {
  constructor () {
    super()
    let recentCouches = localStorager.getRecent('couchurls')
    recentCouches = recentCouches.length ? recentCouches : ['http://localhost:5984/']
    this.state = {
      error: null,
      inputUrl: '',
      loading: false,
      recentCouches
    }
  }

  async tryACouch (inputUrl) {
    inputUrl = parseUrl(inputUrl)
    this.setState({inputUrl})
    this.setState({ loading: true })
    try {
      const { userCtx } = await fetcher.checkSession(inputUrl)
      localStorager.saveRecent('couchurls', inputUrl)
      Object.assign(cache.userCtx, userCtx)
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
                &nbsp; <a href='javascript:void(0)' onClick={() => this.onCouchClick(url)}>
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
      </form>
    )
  }
}
