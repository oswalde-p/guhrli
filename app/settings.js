import * as simpleSettings from './simple/device-settings'
import { SETTINGS_EVENTS, DEFAULT_WARNING_THRESHOLD } from '../common/constants'

class Settings {
  constructor(onTick) {
    this.onTick = onTick
    this.showSyncWarning = true
    this.syncWarningThreshold = DEFAULT_WARNING_THRESHOLD
    this.showBatteryStatus = true
    this.showSecondTime = true
    this.secondtimeOffset = 0
    simpleSettings.initialize((data) => {
      callback(data, this)
      try {
        this.onTick()
      } catch(err) {
        // swallow the error thrown during intializing
        console.log(err)
      }
    })
  }
}


function callback(data, storage) {
  if (!data) {
    return
  } else {
    storage.showBatteryStatus = !!(data[SETTINGS_EVENTS.SHOW_BATTERY_STATUS])

    storage.showSecondTime = !!(data[SETTINGS_EVENTS.SHOW_SECOND_TIME])

    if (data[SETTINGS_EVENTS.SECOND_TIME_OFFSET]) {
      storage.secondtimeOffset = Number(data[SETTINGS_EVENTS.SECOND_TIME_OFFSET].name)
    }
    if (data[SETTINGS_EVENTS.SHOW_SYNC_WARNING]){
      storage.showSyncWarning = data[SETTINGS_EVENTS.SHOW_SYNC_WARNING]
    } else {
      storage.showSyncWarning = false
    }
    if (data[SETTINGS_EVENTS.SYNC_WARNING_THRESHOLD] && data[SETTINGS_EVENTS.SYNC_WARNING_THRESHOLD].name != '') {
      storage.syncWarningThreshold = Number(data[SETTINGS_EVENTS.SYNC_WARNING_THRESHOLD].name)
    }
  }

}

export { Settings }
