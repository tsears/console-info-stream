class Feed {
  constructor (queue) {
    this.queue = queue
    this._name = 'UNSET'
    this._status = 'UNKNOWN'
  }

  get status () {
    return this._status
  }

  get name () {
    return this._name
  }
}

export {
  Feed,
}
