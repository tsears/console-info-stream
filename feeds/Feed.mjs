class Feed {
  constructor() {
    this._name = 'UNSET'
    this._status = 'UNKNOWN'

    this._subscribers = []
  }

  get status() {
    return this._status
  }

  get name() {
    return this._name
  }

  subscribe(cb) {
    this._subscribers.push(cb)
  }

  publish() {
    const payload = {
      name: this._name,
      data: this.data,
    }

    this._subscribers.forEach((s) => s(payload))
  }
}

export { Feed }
