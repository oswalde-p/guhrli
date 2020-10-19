import { settingsStorage } from 'settings'
import * as simpleSettings from './simple/companion-settings'
import { initialize, GuhrliError } from 'fitbit-guhrli-core/companion'

simpleSettings.initialize()

// order is defined by the Settings component
const BG_SOURCES = [
  'NONE',
  'NIGHTSCOUT',
  'TOMATO',
  'XDRIP'
]

const KEYS = {
  BG_SOURCE: 'bgSource',
  NIGHTSCOUT_URL: 'nightscoutUrl'
}

function parseSettings() {
  const res = JSON.parse(settingsStorage.getItem(KEYS.BG_SOURCE))
  const source = res.selected ? BG_SOURCES[res.selected[0]] : 'NONE'
  const nightscoutSetting = settingsStorage.getItem(KEYS.NIGHTSCOUT_URL)
  if (nightscoutSetting) {
    const { name: nightscoutURL } = JSON.parse(nightscoutSetting)
    return { source, nightscoutURL }
  }
  return { source }
}

updateGuhrli()

// don't forget to listen for settings updates...
settingsStorage.addEventListener('change', (evt) => {
  if (evt.key == KEYS.BG_SOURCE || evt.key == KEYS.NIGHTSCOUT_URL){
    updateGuhrli()
  }
})

function updateGuhrli() {
  // first, read current settings from storage
  const currentSettings = parseSettings()
  if (!currentSettings.source) return
  // now initialize the service
  console.log(JSON.stringify(currentSettings, null, 2))
  try {
    initialize(currentSettings)
    // initialize({source: 'NIGHTSCOUT', nightscoutURL: 'https://oswalde-nightscout.herokuapp.com'})
  } catch(err) {
    if (err instanceof GuhrliError) {
      console.error('Error initializing Guhrli companion') // eslint-disable-line no-console
      console.error(err) // eslint-disable-line no-console
    }
    throw (err)
  }
}
