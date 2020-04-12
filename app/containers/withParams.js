import React, { Component } from 'react'
import { parseUrl, getParams } from 'utils/utils'

export default function withParams (WrappedComponent, api, db) {
  class withParamsWrapper extends Component {
    render () {
      const { params: { dbName, couch } } = this.props.match
      const couchUrl = parseUrl(this.props.match.params.couch)
      const { location: { search } } = this.props
      const searchParams = getParams(search)

      return (
        <WrappedComponent
          couch={couch}
          couchUrl={couchUrl}
          dbName={dbName}
          dbUrl={`${couchUrl}${dbName}/`}
          searchParams={searchParams}
          api={api}
          db={db}
          {...this.props}
        />
      )
    }
  }

  withParamsWrapper.displayName = `withDB(${WrappedComponent.displayName || WrappedComponent.name})`
  withParamsWrapper.WrappedComponent = WrappedComponent

  return withParamsWrapper
}
