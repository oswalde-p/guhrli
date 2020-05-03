class sgvServiceBase {
  constructor() {
  }

  async initialize() {
    throw new Error('Child class must implement initialize() method')
  }

  async latestReading() {
    throw new Error('Child class must implement latestReading() method')
  }
}

export { sgvServiceBase }
