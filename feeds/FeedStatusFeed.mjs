import { Feed } from './Feed.mjs'

class FeedStatusFeed extends Feed {
  constructor (queue, args) {
    super(queue)
    this._name = 'Feed Status'
    this._feedInstances = args.feedInstances
    this._status = 'OK'
  }

  get data () {
    const streamStatus = this._feedInstances.map(f => {
      return `${f.name}... ${f.status}`
    })

    return `Initializing data streams...
${streamStatus.join('\n')}
`
  }
}

export {
  FeedStatusFeed,
}
