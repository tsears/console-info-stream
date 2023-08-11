import { variableDelayMap } from './utils/index.mjs'
import feeds from './feeds/feeds.mjs'
// Demo: simulated typing
// To simulate a human typing each character will show up with a slightly
// variable delay
const BASE_DELAY = 20
const DELAY_FUZZ = 90

const queue = []
const feedInstances = []

const initFeed = new feeds.FeedStatusFeed(queue, { feedInstances })

feedInstances.push(
  initFeed,
)
// 'this' fuckery right here
const out = process.stdout.write.bind(process.stdout)
const error = console.error.bind(console)

// still no top-level await in node scripts =/
variableDelayMap(out, BASE_DELAY, DELAY_FUZZ, initFeed.data.split(''))
  .then(() => out('\n'))
  .catch(e => error)
