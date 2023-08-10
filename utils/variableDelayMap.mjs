function processVariableDelayMapItem (cb, baseDelay, fuzzMax, resolve, array) {
  if (array.length === 0) {
    resolve()
    return
  }

  const fuzz = Math.floor(Math.random() * fuzzMax)
  const delay = baseDelay + fuzz

  setTimeout(() => {
    cb(array.shift())
    processVariableDelayMapItem(cb, baseDelay, fuzzMax, resolve, array)
  }, delay)
}

function variableDelayMap (cb, baseDelay = 0, fuzzMax = 0, array) {
  // lets not mutate the passed array
  const clonedArray = [...array]
  return new Promise((resolve, reject) => {
    try {
      processVariableDelayMapItem(cb, baseDelay, fuzzMax, resolve, clonedArray)
    } catch (e) {
      reject(e)
    }
  })
}

export {
  variableDelayMap,
}
