import { Feed } from './Feed.mjs'
import colors from 'colors/safe'

class FeedStatusFeed extends Feed {
  constructor (feedInstances) {
    super()
    this._name = 'Feed Statuses'
    this._feedInstances = feedInstances
    this._status = 'OK'

    setInterval(this.publish.bind(this), 15 * 1000)
  }

  get data () {
    const streamStatus = this._feedInstances.map(f => {
      return `${f.name}... ${colors.green(f.status)}`
    })

    return streamStatus.join('\n')
  }
}

export {
  FeedStatusFeed,
}
