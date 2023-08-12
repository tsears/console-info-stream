import { variableDelayMap } from './utils/index.mjs'
import feeds from './feeds/feeds.mjs'
import colors from 'colors/safe.js'
import 'dotenv/config'

const queue = []
const feedInstances = []

const initFeed = new feeds.FeedStatusFeed(feedInstances)
const weatherFeed = new feeds.WeatherFeed(process.env.WEATHER_API_KEY)

feedInstances.push(
  initFeed,
  weatherFeed
)

// deal with some 'this' shenanigans
const out = process.stdout.write.bind(process.stdout)
const error = console.error.bind(console)

async function typer (string) {
  const BASE_DELAY = 20
  const DELAY_FUZZ = 90

  const chars = string.split('').concat('\n')

  return await variableDelayMap(out, BASE_DELAY, DELAY_FUZZ, chars)
}

async function start () {
  await typer('Initializing feeds...\n')
  await typer(`${colors.underline(initFeed.name)}\n`)
  await typer(initFeed.data + '\n')
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
  // delay before pulling next item off the queue
  const FEED_POLLING_INTERVAL = 10 * 1000

  // With all the artifical delay being introduced due to the simulated typing,
  // theres no guarantee that a given item will finish displaying before the
  // next interval would be hit, so instead of using setInterval we need to do
  // this wacky stuff with setTimeout and a recursive call.
  // https://developer.mozilla.org/en-US/docs/Web/API/setInterval#ensure_that_execution_duration_is_shorter_than_interval_frequency
  ;(function loop () {
    setTimeout(async () => {
      try {
        if (queue.length > 0) {
          const task = queue.shift()
          await typer(`${colors.underline(task.name)}\n\n${task.data}\n\n`)
        }
      } catch (e) {
        error(e)
      }

      loop()
    }, FEED_POLLING_INTERVAL)
  })()
})
