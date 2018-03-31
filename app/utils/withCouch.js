import React, { Component } from 'react'
import fetcher from 'utils/fetcher'
import Loading from 'components/Loading'
import Error from 'components/Error'

export default function withCouch (Wrapped) {
  return class WithCouchWrapper extends Component {
    state = { couchLoaded: false, userCtx: null, couchError: null }

    componentDidMount () {
      const { match: { params: { couchUrl } } } = this.props
      const url = couchUrl.includes('localhost') ? 'http://' + couchUrl : 'https://' + couchUrl
      fetcher.init(url + '/').then(response => {
        this.setState({ couchLoaded: true, userCtx: response.userCtx })
      }).catch(couchError => {
        this.setState({ couchError, couchLoaded: true })
        console.error(url, couchError)
      })
    }

    render () {
      const { match: { params: { couchUrl } } } = this.props
      const { couchLoaded, userCtx } = this.state
      if (!couchLoaded) {
        return <Loading />
      }
      return (
        <Wrapped
          couchUrl={couchUrl}
          userCtx={userCtx}
          {...this.props}
        />
      )
    }
  }
}
