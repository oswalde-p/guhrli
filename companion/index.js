import { settingsStorage } from 'settings'
import { peerSocket } from 'messaging'

import * as simpleSettings from './simple/companion-settings'

import { SETTINGS_EVENTS, FETCH_FREQUENCY_MINS, BG_SOURCES } from '../common/constants'
import { addSlash } from './utils'
import { NightscoutService } from './services/nightscout'
import { TomatoService } from './services/tomato'

// make sure the settings component starts out with default values

settingsStorage.setItem(SETTINGS_EVENTS.SHOW_SECOND_TIME, 'true')
settingsStorage.setItem(SETTINGS_EVENTS.SHOW_BATTERY_STATUS, 'true')
settingsStorage.setItem(SETTINGS_EVENTS.SHOW_SYNC_WARNING, 'true')
settingsStorage.setItem(SETTINGS_EVENTS.SYNC_WARNING_THRESHOLD, '40')
simpleSettings.initialize()

// settingsStorage only sends events to device
// so these are handled manually
// settingsStorage.setItem(SETTINGS_EVENTS.BG_SOURCE, true)
// settingsStorage.setItem(SETTINGS_EVENTS.NIGHTSCOUT_URL, '')

settingsStorage.addEventListener('change', (evt) => {
  if (evt.key == SETTINGS_EVENTS.BG_SOURCE){
    const { selected } = JSON.parse(evt.newValue)
    updateSgvService(selected[0])
  }
})

let sgvService = {}
let displayUnits
let latestReading = {}


function updateSgvService(id) {
  if (id == BG_SOURCES.TOMATO) {
    return sgvService = new TomatoService()
  } else if (id == BG_SOURCES.NIGHTSCOUT) {
    return sgvService = new NightscoutService(addSlash('https://oswalde-nightscout.herokuapp.com/'))
  }
  console.error(`Unknown sgv service id: ${id}`) // eslint-disable-line no-console
}


function sendError(message) {
  console.error(`Error: ${message}`) // eslint-disable-line no-console
  if (peerSocket.readyState == peerSocket.OPEN) {
    peerSocket.send({ error: message})
  }
}

async function initializeService() {
  try {
    const { units } = await sgvService.initialize()
    displayUnits = units
  } catch(err) {
    if (err.message.startsWith('Fetch Error')) {
      sendError('API error, Check URL')
    } else {
      console.log(err) // eslint-disable-line no-console
    }
  }
}

async function fetchReading() {
  try {
    let reading = await sgvService.latestReading()
    console.log({ reading }) // eslint-disable-line no-console
    if (reading && (!latestReading || latestReading.time != reading.time)) {
      latestReading = reading
      sendReading()
    }
  } catch (err) {
    if (err.message.startsWith('Fetch Error')) {
      sendError('API error, Check URL')
    }
  }
}

function sendReading() {
  if (peerSocket.readyState == peerSocket.OPEN) {
    const data = latestReading.serialize(displayUnits)
    return peerSocket.send(data)
  }
  console.log('Cannot send reading: peerSocket closed') // eslint-disable-line no-console
}

peerSocket.onopen = () => {
  console.log('Socket open') // eslint-disable-line no-console
  fetchReading()
}

peerSocket.onerror = function(err) {
  console.log(`Companion ERROR: ${err.code} ${err.message}`) // eslint-disable-line no-console
}

const { selected } = JSON.parse(settingsStorage.getItem(SETTINGS_EVENTS.BG_SOURCE))
updateSgvService(selected[0])
initializeService()

// try to update reading every minute
setInterval(fetchReading, 1000 * 60 * FETCH_FREQUENCY_MINS)
