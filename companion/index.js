import { settingsStorage } from 'settings'
import { peerSocket } from 'messaging'

import * as simpleSettings from './simple/companion-settings'

import { SETTINGS_EVENTS } from '../common/constants'
import { addSlash, formatReading, isValidUrl } from './utils'
import { queryLastReading, queryStatus } from './nightscout'

// make sure the settings component starts out with default values

settingsStorage.setItem(SETTINGS_EVENTS.SHOW_SECOND_TIME, 'true')
settingsStorage.setItem(SETTINGS_EVENTS.SHOW_BATTERY_STATUS, 'true')
settingsStorage.setItem(SETTINGS_EVENTS.SHOW_SYNC_WARNING, 'true')
settingsStorage.setItem(SETTINGS_EVENTS.SYNC_WARNING_THRESHOLD, '40')

simpleSettings.initialize()

const nightscoutConfig = {}

setNightscoutUrl(JSON.parse(settingsStorage.getItem('nightscoutUrl')).name)

settingsStorage.addEventListener('change', (evt) => {
  if (evt.key == 'nightscoutUrl') {
    setNightscoutUrl(JSON.parse(evt.newValue).name)
  }
})

function setNightscoutUrl(url) {
  url = addSlash(url)
  if (isValidUrl(url)) {
    nightscoutConfig.url = url
  } else {
    sendError('Bad nightscout url')
  }
}


function sendError(message) {
  if (peerSocket.readyState == peerSocket.OPEN) {
    peerSocket.send({ error: message})
  }
}

async function intializeNightscout() {
  if (!nightscoutConfig && nightscoutConfig.url) sendError('Nightscout not configured')
  try {
    const { settings }  = await queryStatus(nightscoutConfig.url)
    nightscoutConfig.units = settings.units
    nightscoutConfig.thresholds = settings.thresholds
  } catch(err) {
    if (err.message.startsWith('Fetch Error')) {
      sendError('API error, Check URL')
    }
  }
}

peerSocket.onopen = () => {
  console.log('Socket open')
}

peerSocket.onmessage = async evt =>{
  if (evt.data == 'getReading') {
    try {
      const { sgv, age } = await queryLastReading(nightscoutConfig.url)
      peerSocket.send({
        reading: formatReading(sgv, nightscoutConfig.units),
        age
      })
    } catch (err) {
      if (err.message.startsWith('Fetch Error')) {
        sendError('API error, Check URL')
      }
    }
  }
}

intializeNightscout()
