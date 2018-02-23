import React from 'react'
import {
  sync,
  clone,
  getLocalInfo,
  subscribeToChanges,
  getRemoteInfo,
  addDocsToRemote,
  addDocsToLocal
} from 'utils'
import Moment from 'moment'
import withOfflineState from 'tlvince-react-offline-hoc'

class SyncContainer extends React.Component {
  constructor (props) {
    super(props)
    this.replicator = null
    this.state = {
      events: [],
      startTime: new Date(),
      allChanges: 0
    }
  }

  componentDidMount = () => {
    this.replicator = sync()
    .on('change', (info) => {
      // if (info.direction === 'push') {
      //   if (this.state.allChanges) {
      //     console.log(info)
      //     this.setState({allChanges: this.state.allChanges - 1})
      //   }
      // } else {
      //   this.setState({allChanges: this.state.allChanges - 1})
      // }
      this.addEvent('change', info)
      this.setState({allChanges: this.state.allChanges - info.change.docs.length})
    })
    .on('paused', (err) => this.addEvent('paused'))
    .on('active', () => this.addEvent('active'))
    .on('denied', (err) => this.addEvent('denied', err))
    .on('complete', (info) => this.addEvent('complete', info))
    .on('error', (err) => this.addEvent('error', err))
    // .catch(err => this.addEvent('caught error', err))

    this.changesSubscription = subscribeToChanges().on('change', change => {
      console.log(change)
      this.setState({ allChanges: this.state.allChanges + change.changes.length })
    })
  }

  wentOffline = () => {
    // if (!this.changesSubscription) {
    //
    // }
  }

  backOnline = () => {
    // this.changesSubscription.cancel()
  }

  componentWillReceiveProps = (newProps) => {
    if (this.props.isOnline !== newProps.isOnline) {
      const type = newProps.isOnline ? 'Back online' : 'Went Offline'
      this.addEvent(type, null, newProps.isOnline)
      if (!newProps.isOnline) {
        this.wentOffline()
      } else {
        this.backOnline()
      }
      this.onClickInfoLocal()
    }
  }

  componentWillUnmount = () => {
    // wtf promise returned?
    // this.replicator.cancel()
    // this.this.changesSubscription.cancel()
  }

  addEvent = (type, info, isOnline = this.props.isOnline) => {
    const events = clone(this.state.events)
    const timestamp = new Date().toISOString()
    events.unshift({
      number: events.length,
      type,
      info,
      timestamp,
      wasOnline: isOnline,
      difference: Moment(timestamp).diff(this.state.startTime, 'seconds')
    })
    this.setState({ events })
  }

  onClickRemote = (event, num) => {
    addDocsToRemote(num)
  }

  onClickLocal = (event, num) => {
    addDocsToLocal(num)
  }

  onClickClear = () => {
    this.setState({
      events: [],
      startTime: new Date()
    })
  }

  onClickInfoLocal = () => {
    getLocalInfo().then(info => {
      this.addEvent('local info', info)
    })
  }

  onClickInfoRemote = () => {
    getRemoteInfo().then(info => {
      this.addEvent('remote info', info)
    })
  }

  highlightEvent = (index) => {
    const events = clone(this.state.events).map(event => {
      event.highlighted = false
      return event
    })
    const event = events[index]
    event.highlighted = true
    this.setState({events})
  }

  render () {
    const {isOnline} = this.props
    const {allChanges} = this.state
    return (
      <div>
        <div className='header'>
          <h1>Aloha PouchDB sync events {isOnline ? '[online]' : '[offline]'}</h1>
          <div>
            allChanges: {allChanges}
            {/* lastPushedSequenceNumber: {lastPushedSequenceNumber}<br /> */}
            {/* Pending changes to upload: {latestLocalSequenceNumber - lastPushedSequenceNumber} */}
          </div>
          <div className='local-buttons'>
            <button onClick={this.onClickInfoLocal}>Get Local DB Info</button><br />
            <button onClick={this.onClickLocal}>Add 1 doc to local</button>
            <button onClick={(e) => this.onClickLocal(e, 5)}>Add 5 docs to local</button>
          </div>
          <div className='remote-buttons'>
            <button onClick={this.onClickInfoRemote}>Get Remote DB Info</button><br />
            <button onClick={this.onClickRemote}>Add 1 doc to remote</button>
            <button onClick={(e) => this.onClickRemote(e, 5)}>Add 5 docs to remote</button>
          </div>
        </div>
        {this.state.events.map(({number, wasOnline, highlighted, difference, type, info, timestamp}, i) => {
          let classNames = 'event'
          classNames += highlighted ? ' highlighted' : ''
          classNames += (wasOnline) ? '  online' : ' offline'
          return <div onClick={() => this.highlightEvent(i)} className={classNames} key={timestamp}>
            <div className='event-header'>
              <h4>{number}: {type}</h4>
              <div className='time'>
                {Moment(timestamp).format('MMMM Do YYYY, h:mm:ss a')}. Seconds from start: {difference}
              </div>
            </div>
            {info && <pre>{JSON.stringify(info)}</pre>}
          </div>
        })}
        <button className='clear' onClick={this.onClickClear}>Clear All</button>
      </div>
    )
  }
}
export default withOfflineState(SyncContainer)
