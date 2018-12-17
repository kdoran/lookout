import React from 'react'
import {Route} from 'react-router-dom'
import {parseUrl, getParams} from 'utils/utils'
import initApi from './init-api'

export default class CouchRoute extends React.Component {
  state = {initialized: false}

  async componentDidMount () {
    await this.init(this.props)
  }

  async componentWillReceiveProps (props) {
    await this.init(props)
  }

  init = async (props) => {
    this.setState({initialized: false})
    const {computedMatch: {params: {dbName, couch}}, location: {search}} = props
    const couchUrl = parseUrl(props.computedMatch.params.couch)
    const searchParams = getParams(search)
    const api = await initApi(dbName, couchUrl)
    this.setState({couch, couchUrl, dbName, api, searchParams, initialized: true})
  }

  render () {
    const {component, ...rest} = this.props
    const {initialized, couch, couchUrl, dbName, api, searchParams} = this.state

    if (!initialized) return null

    return (
      <Route {...rest} render={routeProps => {
        return React.createElement(component, {
          ...routeProps,
          couch,
          couchUrl,
          dbName,
          dbUrl: `${couchUrl}${dbName}/`,
          api,
          searchParams
        })
      }} />
    )
  }
}
