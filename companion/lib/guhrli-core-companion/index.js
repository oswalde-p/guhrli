import { settingsStorage } from 'settings'
import { peerSocket } from 'messaging'


import { SETTINGS_EVENTS, FETCH_FREQUENCY_MINS, BG_SOURCES } from './consts'
import { addSlash } from './utils'
import { NightscoutService } from './services/nightscout'
import { TomatoService } from './services/tomato'
import { XdripService } from './services/xdrip'

export class GuhrliCompanion {
  constructor() {
    // first, listen for settings updates...
    settingsStorage.addEventListener('change', (evt) => {
      if (evt.key == SETTINGS_EVENTS.BG_SOURCE){
        const { selected } = JSON.parse(evt.newValue)
        this.updateSgvService(selected[0])
        this.initializeService()
      } else if (evt.key == SETTINGS_EVENTS.NIGHTSCOUT_URL){
        const { selected } = JSON.parse(settingsStorage.getItem(SETTINGS_EVENTS.BG_SOURCE))
        this.updateSgvService(selected[0])
        this.initializeService()
      }
    })

    // ...and socket events
    peerSocket.onopen = () => {
      console.log('Socket open') // eslint-disable-line no-console
      this.fetchReading()
    }

    peerSocket.onerror = function(err) {
      console.log(`Companion ERROR: ${err.code} ${err.message}`) // eslint-disable-line no-console
    }

    this.sgvService = {}
    this.displayUnits = null
    this.latestReading = {}

    // finally, try to set the initial source
    const res = JSON.parse(settingsStorage.getItem(SETTINGS_EVENTS.BG_SOURCE))
    const selected = res ? res.selected : []
    this.updateSgvService(selected[0])
    if (this.sgvService) this.initializeService()

    // try to update reading every minute
    setInterval(() => this.fetchReading(), 1000 * 60 * FETCH_FREQUENCY_MINS)
  }

  updateSgvService(id) {
    switch (id) {
      case BG_SOURCES.TOMATO:
        return this.sgvService = new TomatoService()
      case BG_SOURCES.NIGHTSCOUT: {
        const nightscoutSetting = settingsStorage.getItem(SETTINGS_EVENTS.NIGHTSCOUT_URL)
        if (nightscoutSetting) {
          const { name: url } = JSON.parse(nightscoutSetting)
          return this.sgvService = new NightscoutService(addSlash(url))
        }
        return console.error('Nighscout url not set') // eslint-disable-line no-console
      }
      case BG_SOURCES.XDRIP:
        return this.sgvService = new XdripService()
      default:
        console.error(`Unknown sgv service id: ${id}`) // eslint-disable-line no-console
        return
    }
  }

  async initializeService() {
    try {
      const { units } = await this.sgvService.initialize()
      this.displayUnits = units
    } catch(err) {
      if (err.message.startsWith('Fetch Error')) {
        sendError('API error, Check URL')
      } else {
        console.log('Error initializing service') // eslint-disable-line no-console
        console.log(err) // eslint-disable-line no-console
      }
    }
  }

  async fetchReading() {
    if (!this.sgvService) return
    try {
      let reading = await this.sgvService.latestReading()
      console.log(JSON.stringify(reading, null, 2)) // eslint-disable-line no-console
      if (reading && (!this.latestReading || this.latestReading.time != reading.time)) {
        this.latestReading = reading
        this.sendReading()
      }
    } catch (err) {
      if (err.message.startsWith('Fetch Error')) {
        sendError('API error, Check URL')
      } else {
        console.error(err)
      }
    }
  }

  sendReading() {
    if (peerSocket.readyState == peerSocket.OPEN) {
      const data = this.latestReading.serialize(this.displayUnits)
      return peerSocket.send(data)
    }
    console.log('Cannot send reading: peerSocket closed') // eslint-disable-line no-console
  }
}


function sendError(message) {
  console.error(`Error: ${message}`) // eslint-disable-line no-console
  if (peerSocket.readyState == peerSocket.OPEN) {
    peerSocket.send({ error: message})
  }
}

export function initialize() {
  return new GuhrliCompanion()
}
