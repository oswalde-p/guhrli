import { peerSocket } from 'messaging'
import { config } from '../../../guhrli.config.js'

class Guhrli {
  constructor() {
    this.reading = '-',
    this.time = null,
    this.isStale = false,
    this.alarm = null
    this.error = false

    peerSocket.onmessage = evt => {
      // make sure it's one of our events first
      if (evt.data && evt.data.type == 'guhrli') {
        this.processEvent(evt)
      }
    }
  }

  formattedAge() {
    if (!this.time) return
    const age = Math.round((new Date() - this.time) / (60 * 1000))
    const staleAge = config.STALE_SGV_AGE || 5
    if (age > staleAge) {
      if (age < 60 ) {
        return `${age}m`
      } else {
        return `${Math.round(age / 60)}h`
      }
    } else {
      return ''
    }
  }

  processEvent(evt) {
    const { data } = evt
    if (data.error) {
      this.error = true
      return
    }
    this.error = false
    if (data.reading) {
      this.reading = data.reading
      this.time = data.time
      this.alarm = data.alarm
    }
  }
}

export { Guhrli }
