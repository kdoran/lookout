import React from 'react'
import Loading from 'components/Loading'
import Error from 'components/Error'
import Breadcrumbs from 'components/Breadcrumbs'
import { copyTextToClipboard } from 'utils/utils'
import { downloadJSON } from 'utils/download'

import './doc-container.css'

export default class ConfigContainer extends React.Component {
  state = {
    sections: null,
    loaded: false,
    error: null,
    docId: null,
    resp: {}
  }

  componentDidMount () {
    this.load()
  }

  componentDidUpdate (newProps) {
    const {dbUrl, searchParams: {offset}} = this.props
    if (newProps.dbUrl !== dbUrl || newProps.searchParams.offset !== offset) {
      this.load()
    }
  }

  load = async () => {
    try {
      const resp = await this.props.api.getConfig()
      const sections = []
      let rows
      for (let prop in resp) {
        rows = []
        for (let key in resp[prop]) {
          rows.push({ key, value: resp[prop][key] })
        }
        sections.push({ name: prop, rows })
      }
      this.setState({ sections, loaded: true, resp })
    } catch (error) {
      this.setState({ error, loaded: true })
      console.error(error)
    }
  }

  copy = e => {
    e.preventDefault()
    copyTextToClipboard(JSON.stringify(this.state.resp, null, 2))
  }

  download = event => {
    event.preventDefault()
    const { couch } = this.props
    downloadJSON(this.state.resp, `${couch}-config`)
  }

  render () {
    const { couch } = this.props
    const { loaded, error, sections } = this.state

    return (
      <div className='config-container'>
        <Breadcrumbs couch={couch} docId={'_config'} />
        <div className='controls'>
          <a href='#' onClick={this.download}>download</a>
          <a href='#' onClick={this.copy}>copy to clipboard</a>
        </div>
        {error && <Error error={error} />}
        {!error && !loaded && (<Loading />)}
        {!error && loaded && (
          <div>
            {sections.map(section => (
              <section key={section.name}>
                <div className='config-container--header'>{section.name}</div>
                <div className='config-container--content'>
                  {section.rows.map(({ key, value }) => (<div key={key}>
                    {key}: {value}
                  </div>))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    )
  }
}
