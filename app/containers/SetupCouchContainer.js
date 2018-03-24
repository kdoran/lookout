import React from 'react'
import fetcher from 'utils/fetcher'
import localStorager from 'utils/localstorager'

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

  tryACouch () {
    let { inputUrl } = this.state
    inputUrl = parseUrlFromInput(inputUrl)
    this.setState({ inputUrl, loading: true }, () => {
      fetcher.init(inputUrl).then(response => {
        localStorager.saveRecent('couchurls', inputUrl)
        window.location.href = '/' + inputUrl.split('//')[1]
      }).catch(error => this.setState({ error, loading: false }))
    })
  }

  onSubmit = event => {
    event.preventDefault()
    this.tryACouch()
  }

  render () {
    const { inputUrl, recentCouches, error, loading } = this.state
    return (
      <form onSubmit={this.onSubmit}>
        <h1>splashboard.</h1>
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
            {recentCouches.map(inputUrl => (
              <span key={inputUrl}>
                &nbsp; <a href='javascript:void(0)' onClick={() => this.setState({ inputUrl }, () => this.tryACouch())}>
                  {inputUrl}
                </a>
              </span>
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

function parseUrlFromInput (url) {
  if (!url.includes('http')) {
    url = 'https://' + url
  }
  if (url[url.length - 1] !== '/') {
    url += '/'
  }
  return url
}
