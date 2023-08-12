import { variableDelayMap } from './utils/index.mjs'
import feeds from './feeds/feeds.mjs'
import colors from 'colors/safe'

// "Typing"
const BASE_DELAY = 20
const DELAY_FUZZ = 90

// how often to check for updates
const FEED_POLLING_INTERVAL = 10 * 1000

const queue = []
const feedInstances = []

const initFeed = new feeds.FeedStatusFeed(feedInstances)

feedInstances.push(
  initFeed,
)

// 'this' fuckery right here
const out = process.stdout.write.bind(process.stdout)
const error = console.error.bind(console)

async function typer (string) {
  const chars = string.split('').concat('\n')
  await variableDelayMap(out, BASE_DELAY, DELAY_FUZZ, chars)
}

async function start () {
  await typer('Initializing feeds...\n')
  await typer(`${colors.underline(initFeed.name)}\n`)
  await typer(initFeed.data)
}

function addToQueue (data) {
  // only one item from a given feed can be in the queue at a given time, but
  // newer data can overwrite data already in the queue...
  const oldDataIndex = queue.findIndex(q => q.name === data.name)

  if (oldDataIndex > -1) {
    queue[oldDataIndex] = data
  } else {
    queue.push(data)
  }
}

feedInstances.forEach(instance => {
  instance.subscribe(addToQueue)
})

// no top-level await
start().then(() => {
  setInterval(async () => {
    try {
      if (queue.length > 0) {
        const task = queue.shift()
        await typer(`${colors.underline(task.name)}\n\n${task.data}`)
      }
    } catch (e) {
      error(e)
    }
  }, FEED_POLLING_INTERVAL)
})
