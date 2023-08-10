import { variableDelayMap } from './utils/index.mjs'

// Demo: simulated typing
// To simulate a human typing each character will show up with a slightly
// variable delay
const BASE_DELAY = 20
const DELAY_FUZZ = 90

const string = 'The quick brown fox jumps over the lazy dog'
// 'this' fuckery right here
const out = process.stdout.write.bind(process.stdout)
const error = console.error.bind(console)

// still no top-level await in node scripts =/
variableDelayMap(out, BASE_DELAY, DELAY_FUZZ, string.split(''))
  .then(() => out('\n'))
  .catch(e => error)
