import { Feed } from './Feed.mjs'
import { uptime, memoryUsage, platform, pid, version } from 'node:process'

class ProcessInfoFeed extends Feed {
  constructor() {
    super()
    this._name = 'Process Info'
    this._status = 'OK'

    setInterval(this.publish.bind(this), 15 * 1000)
    this.publish()
  }

  get data() {
    return `Node Version: ${version}
Platform: ${platform}
PID: ${pid}
Memory Usage: ${Math.round(memoryUsage.rss() / Math.pow(1024, 2))} MB
Uptime: ${Math.round(Math.floor(uptime()) / 60)} minutes`
  }
}

export { ProcessInfoFeed }
