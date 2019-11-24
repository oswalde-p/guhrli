import clock from 'clock'
import document from 'document'
import { battery } from 'power'
import { me as device } from 'device'
import { vibration } from 'haptics'
import { peerSocket } from 'messaging'

import * as simpleSettings from './simple/device-settings'
import { formatDate, getTimeStr, round, isEmpty } from '../common/utils'
import { SETTINGS_EVENTS, DEFAULT_WARNING_THRESHOLD, LOW_BATTERY_LIMIT } from '../common/constants'

const SGV_AGE_DISPLAY = 5 // minutes

// Update the clock every minute
clock.granularity = 'minutes'

// settings variables

let secondtimeOffset = 0
let showSyncWarning = true
let syncWarningThreshold = DEFAULT_WARNING_THRESHOLD

// Get a handle on the <text> element
const timeText = document.getElementById('time')
const message = document.getElementById('message')
const dateText = document.getElementById('date')
const batteryStatusText = document.getElementById('stat1')
const secondTimeText = document.getElementById('stat2')

// nightscout info elements
const sgvText = document.getElementById('reading')
const sgvAgeText = document.getElementById('reading-age')

batteryStatusText.text = 'init'
// Update the <text> element every tick with the current time
clock.ontick = (evt) => {
  let now = evt.date
  updateClock(now)
  updateDate(now)
  updateSecondTime(now, secondtimeOffset)
  updateBattery()
  updateConnectionStatus(now)
  requestReading()
}

function updateConnectionStatus(now){
  let minutesSinceSync = (now - device.lastSyncTime) / (60*1000)
  if (showSyncWarning && minutesSinceSync > syncWarningThreshold){
    displaySyncWarning(minutesSinceSync)
    if (message.text == ''){
      // showing warning for first time
      warningVibrate()
    }
  }else{
    clearAlert('syncWarning')
  }

}

function displaySyncWarning(minutes){
  if (message){
    let roundTo = 5
    if (minutes > 60) {
      roundTo = 10
    }
    const roundedMinutes = round(minutes, roundTo)
    setAlert({
      key: 'syncWarning',
      msg: `${roundedMinutes}m since sync`,
      priority: 0
    })
  }
}

function updateDate(now){
  dateText.text = formatDate(now.getDate(), now.getMonth())
}

function updateSecondTime(now, offset){
  secondTimeText.text = getTimeStr(now, offset)
}

function updateBattery(){
  if(battery.chargeLevel > LOW_BATTERY_LIMIT && !battery.charging){
    batteryStatusText.text = Math.floor(battery.chargeLevel) + '%'
  } else {
    batteryStatusText.text = ''
  }
}

function updateClock(now){
  timeText.text = getTimeStr(now)
}

function requestReading(){
  // here we make the call to the companion to fetch data from nightscout
  if (peerSocket.readyState == peerSocket.OPEN) {
    peerSocket.send('getReading')
  }
}

function warningVibrate(){
  vibration.start('nudge-max')
}

function initSettings() {
  batteryStatusText.style.display = 'inline'
  secondTimeText.style.display = 'inline'
  updateSecondTime(new Date(), 0)
  showSyncWarning = true
  updateConnectionStatus(new Date())
}

let messages = []

function setAlert({key, msg, priority}) {
  messages.push({ key, msg, priority })
  messages.sort((a, b) => a.priority - b.priority)
  message.text = messages[0].msg
}

function clearAlert(key) {
  if (!key) messages = []
  messages = messages.filter(e => e.key != key)
  if (messages.length == 0) {
    message.text = ''
  } else {
    message.text = messages[0].msg
  }
}

peerSocket.onmessage = evt => {
  const { data } = evt
  if (data.error) {
    setAlert({key: 'apiError', msg: data.error, priority: 0})
    return
  }
  clearAlert('apiError')

  if (data.reading) {
    updateReading(data.reading, data.age)
    setAlarm(data.alarm)
  }

}

function setAlarm(alarm) {
  // this should be done by adding classes but I can't work out how to do that
  timeText.style.fill = colorMap[alarm] || colorMap.default
}

const colorMap = {
  default: '#007700',
  URGENT_HIGH: '#800000',
  HIGH: '#ff9900',
  LOW: '#1ac6ff',
  URGENT_LOW: '#0000bb'
}

function updateReading(reading, age) {
  sgvText.text = reading
  if (age > SGV_AGE_DISPLAY) {
    if (age < 60 ) {
      sgvAgeText.text = `${age}m`
    } else {
      sgvAgeText.text = `${Math.round(age / 60)}h`
    }
  } else {
    sgvAgeText.text = ''
  }
  // don't forget to change the clock colour!
}

/* -------- SETTINGS -------- */
function settingsCallback(data) {
  if (!data) {
    return
  } else if (isEmpty(data)) {
    initSettings()
  } else {
    data[SETTINGS_EVENTS.SHOW_BATTERY_STATUS] ? batteryStatusText.style.display = 'inline' : batteryStatusText.style.display = 'none'

    data[SETTINGS_EVENTS.SHOW_SECOND_TIME] ? secondTimeText.style.display = 'inline' : secondTimeText.style.display = 'none'

    if (data[SETTINGS_EVENTS.SECOND_TIME_OFFSET]) {
      secondtimeOffset = Number(data[SETTINGS_EVENTS.SECOND_TIME_OFFSET].name)
      updateSecondTime(new Date(), secondtimeOffset)
    }

    if (data[SETTINGS_EVENTS.SHOW_SYNC_WARNING]){
      showSyncWarning = data[SETTINGS_EVENTS.SHOW_SYNC_WARNING]
      updateConnectionStatus(new Date())
    } else {
      showSyncWarning = false
      updateConnectionStatus(new Date())
    }

    if (data[SETTINGS_EVENTS.SYNC_WARNING_THRESHOLD] && data[SETTINGS_EVENTS.SYNC_WARNING_THRESHOLD].name != '') {
      syncWarningThreshold = Number(data[SETTINGS_EVENTS.SYNC_WARNING_THRESHOLD].name)
      updateConnectionStatus(new Date())
    }
  }

}
simpleSettings.initialize(settingsCallback)
peerSocket.onopen = requestReading
