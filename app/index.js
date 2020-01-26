import clock from 'clock'
import document from 'document'
import { battery } from 'power'
import { me as device } from 'device'
import { vibration } from 'haptics'
import { peerSocket } from 'messaging'

import { formatDate, getTimeStr, round } from '../common/utils'
import { LOW_BATTERY_LIMIT } from '../common/constants'
import { Settings } from './settings'

const SGV_AGE_DISPLAY = 5 // after this many minutes, age of reading is displayed

// Update the clock every minute
clock.granularity = 'minutes'

// Get a handle on the <text> element
const timeText = document.getElementById('time')
const message = document.getElementById('message')
const dateText = document.getElementById('date')
const batteryStatusText = document.getElementById('stat1')
const secondTimeText = document.getElementById('stat2')

// nightscout info elements
const sgvText = document.getElementById('reading')
const sgvAgeText = document.getElementById('reading-age')

let lastReading = {}

batteryStatusText.text = 'init'


function onTick(evt) {
  let now = evt ? evt.date : new Date()
  updateClock(now)
  updateDate(now)
  updateSecondTime(now) // weird
  updateBattery()
  updateConnectionStatus(now)
  updateReadingAge()
}

const settings = new Settings(onTick)
clock.ontick = onTick

function updateConnectionStatus(now){
  let minutesSinceSync = (now - device.lastSyncTime) / (60*1000)
  if (settings.showSyncWarning && minutesSinceSync > settings.syncWarningThreshold){
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

function updateSecondTime(now){
  secondTimeText.text = settings.showSecondTime ? getTimeStr(now, settings.secondtimeOffset) : ''
}

function updateBattery(){
  if (settings.showBatteryStatus) {
    if(battery.chargeLevel > LOW_BATTERY_LIMIT && !battery.charging){
      return batteryStatusText.text = Math.floor(battery.chargeLevel) + '%'
    }
  }
  batteryStatusText.text = ''
}

function updateClock(now){
  timeText.text = getTimeStr(now)
}

function checkConnection(){
  if (peerSocket.readyState == peerSocket.OPEN) {
    message.text = ''
    return
  }
  console.log('peerSocket not ready, state: ' + peerSocket.readyState)
  message.text = 'Disconnected'
}

// check connection every 5 minutes
setInterval(checkConnection, 1000 * 60 * 5)


function warningVibrate(){
  vibration.start('nudge-max')
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
    lastReading = data
    updateReading()
    updateReadingAge()
    setAlarm()
  }
}

function setAlarm() {
  // this should be done by adding classes but I can't work out how to do that
  timeText.style.fill = colorMap[lastReading.alarm] || colorMap.default
}

const colorMap = {
  default: '#007700',
  URGENT_HIGH: '#800000',
  HIGH: '#ff9900',
  LOW: '#1ac6ff',
  URGENT_LOW: '#0000bb'
}

function updateReading() {
  if (!lastReading) return
  sgvText.text = lastReading.reading
}

function updateReadingAge() {
  if (!lastReading) return
  const age = Math.round((new Date() - lastReading.time) / (60 * 1000))
  if (age > SGV_AGE_DISPLAY) {
    if (age < 60 ) {
      sgvAgeText.text = `${age}m`
    } else {
      sgvAgeText.text = `${Math.round(age / 60)}h`
    }
  } else {
    sgvAgeText.text = ''
  }
}

peerSocket.onopen = function() {
  console.log('peersocket open')
}

peerSocket.onerror = function(err) {
  console.log(`Device ERROR: ${err.code} ${err.message}`)
}
