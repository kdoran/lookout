import React, { Component } from 'react'
import fetcher from 'utils/fetcher'
import localStorager from 'utils/localstorager'
import Loading from 'components/Loading'

export default function withCouch (Wrapped) {
  return class WithCouchWrapper extends Component {
    state = { loaded: false }

    componentDidMount () {
      const { match: { params: { couchUrl } } } = this.props
      const url = couchUrl.includes('localhost') ? 'http://' + couchUrl : 'https://' + couchUrl
      fetcher.init(url + '/').then(response => {
        this.setState({ loaded: true })
        localStorager.set('userCtx', response.userCtx)
      }).catch(couchError => {
        console.log(url, couchError)
        // window.location.href = '/'
      })
    }

    render () {
      const {loaded} = this.state
      const { match: { params: { couchUrl } } } = this.props
      if (!loaded) {
        return <Loading />
      }
      return (
        <Wrapped
          couchUrl={couchUrl}
          {...this.props}
        />
      )
    }
  }
}
