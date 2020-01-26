import { settingsStorage } from 'settings'
import { peerSocket } from 'messaging'

import * as simpleSettings from './simple/companion-settings'

import { SETTINGS_EVENTS, FETCH_FREQUENCY_MINS } from '../common/constants'
import { addSlash } from './utils'
// import { nightscoutService } from './services/nightscout'
import { tomatoService } from './services/tomato'

// make sure the settings component starts out with default values

settingsStorage.setItem(SETTINGS_EVENTS.SHOW_SECOND_TIME, 'true')
settingsStorage.setItem(SETTINGS_EVENTS.SHOW_BATTERY_STATUS, 'true')
settingsStorage.setItem(SETTINGS_EVENTS.SHOW_SYNC_WARNING, 'true')
settingsStorage.setItem(SETTINGS_EVENTS.SYNC_WARNING_THRESHOLD, '40')
settingsStorage.setItem('useTomatoServer', true)
settingsStorage.setItem('nightscoutUrl', '')

simpleSettings.initialize()

let sgvService = {}
let displayUnits
let latestReading = {}

// setUseTomatoServer(JSON.parse(settingsStorage.getItem('useTomatoServer')).name)
// setNightscoutUrl(JSON.parse(settingsStorage.getItem('nightscoutUrl')).name)

settingsStorage.addEventListener('change', (evt) => {
  if (evt.key == 'nightscoutUrl') {
    settingsStorage.setItem('nightscoutUrl', addSlash(JSON.parse(evt.newValue).name))
  } else if (evt.key == 'useTomatoServer') {
    // setUseTomatoServer(JSON.parse(evt.newValue).name)
  }
})

function sendError(message) {
  console.error(`Error: ${message}`) // eslint-disable-line no-console
  if (peerSocket.readyState == peerSocket.OPEN) {
    peerSocket.send({ error: message})
  }
}

async function initializeService() {
  // TODO: set service based on settings
  sgvService = new tomatoService()
  // sgvService = new nightscoutService('https://oswalde-nightscout.herokuapp.com/')
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

initializeService()

// try to update reading every minute
setInterval(fetchReading, 1000 * 60 * FETCH_FREQUENCY_MINS)
