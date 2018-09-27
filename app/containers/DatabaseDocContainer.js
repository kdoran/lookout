import React from 'react'
import fetcher from 'utils/fetcher'
import Loading from 'components/Loading'
import Error from 'components/Error'
import AllowEditButton from 'components/AllowEditButton'
import Breadcrumbs from 'components/Breadcrumbs'
import { Link } from 'react-router-dom'
import { downloadJSON } from 'utils/download'

import './doc-container.css'

export default class extends React.Component {
  state = {
    sections: null,
    loaded: false,
    error: null,
    docId: null
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    const docId = decodeURIComponent(nextProps.match.path.split('/:couch/')[1])
    return { ...prevState, docId }
  }

  async componentDidMount () {
    const { couchUrl } = this.props
    const { docId } = this.state
    try {
      const resp = await fetcher.get(`${couchUrl}${docId}`)
      const sections = []
      let rows
      for (let prop in resp) {
        rows = []
        for (let key in resp[prop]) {
          rows.push({ key, value: resp[prop][key] })
        }
        sections.push({ name: prop, rows })
      }
      this.setState({ sections, loaded: true })
    } catch (error) {
      this.setState({ error, loaded: true })
      console.error(error)
    }
  }

  render () {
    const { rev } = this.props.match.params
    const { couchUrl, couch } = this.props
    const { loaded, error, sections, docId } = this.state

    return (
      <div className='config-container'>
        <Breadcrumbs couch={couch} docId={'_config'} />
        {error && <Error error={error} />}
        {!error && !loaded && (<Loading />)}
        {!error && loaded && (
          <div>
            {sections.map(section => (
              <section>
                <div className='config-container--header'>{section.name}</div>
                <div className='config-container--content'>
                  {section.rows.map(({ key, value }) => (<div>
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
