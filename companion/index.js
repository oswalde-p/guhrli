import { settingsStorage } from 'settings'
import { peerSocket } from 'messaging'

import * as simpleSettings from './simple/companion-settings'

import { SETTINGS_EVENTS } from '../common/constants'
import { addSlash, formatReading, getAlarmType, isValidUrl } from './utils'
import { queryLastReading, queryStatus } from './nightscout'
import { queryTomatoReading } from './tomato'

// make sure the settings component starts out with default values

settingsStorage.setItem(SETTINGS_EVENTS.SHOW_SECOND_TIME, 'true')
settingsStorage.setItem(SETTINGS_EVENTS.SHOW_BATTERY_STATUS, 'true')
settingsStorage.setItem(SETTINGS_EVENTS.SHOW_SYNC_WARNING, 'true')
settingsStorage.setItem(SETTINGS_EVENTS.SYNC_WARNING_THRESHOLD, '40')

simpleSettings.initialize()

let useTomatoServer = false
const nightscoutConfig = {}

setUseTomatoServer(JSON.parse(settingsStorage.getItem('useTomatoServer')).name)
setNightscoutUrl(JSON.parse(settingsStorage.getItem('nightscoutUrl')).name)

settingsStorage.addEventListener('change', (evt) => {
  if (evt.key == 'nightscoutUrl') {
    setNightscoutUrl(JSON.parse(evt.newValue).name)
  } else if (evt.key == 'useTomatoServer') {
    setUseTomatoServer(JSON.parse(evt.newValue.name))
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

function setUseTomatoServer(val) {
  useTomatoServer = Boolean(val)
}


function sendError(message) {
  if (peerSocket.readyState == peerSocket.OPEN) {
    peerSocket.send({ error: message})
  }
}

async function intializeNightscout() {
  if (!nightscoutConfig && nightscoutConfig.url) sendError('Nightscout not configured')
  try {
    const { units, alarms }  = await queryStatus(nightscoutConfig.url)
    // I don't understand why it thinks this is bad in this case, or how to fix it
    nightscoutConfig.units = units // eslint-disable-line require-atomic-updates
    nightscoutConfig.alarms = alarms // eslint-disable-line require-atomic-updates
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
      if ( useTomatoServer ) { // tomato has priority if set to true
        const { sgv, age } = await queryTomatoReading()
        peerSocket.send({
          reading: formatReading(sgv, nightscoutConfig.units),
          age,
          alarm: getAlarmType(sgv, nightscoutConfig.alarms)
        })
        return
      }
      const { sgv, age } = await queryLastReading(nightscoutConfig.url)
      peerSocket.send({
        reading: formatReading(sgv, nightscoutConfig.units),
        age,
        alarm: getAlarmType(sgv, nightscoutConfig.alarms)
      })
    } catch (err) {
      if (err.message.startsWith('Fetch Error')) {
        sendError('API error, Check URL')
      }
    }
  }
}

intializeNightscout()
