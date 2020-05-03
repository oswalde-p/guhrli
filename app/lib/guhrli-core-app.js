import { peerSocket } from 'messaging'
import { SGV_AGE_DISPLAY } from '../../guhrli.config.json'

class Guhrli {
  constructor() {
    this.reading = null,
    this.time = null,
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
    const age = Math.round((new Date() - this.time) / (60 * 1000))
    if (age > SGV_AGE_DISPLAY) {
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
