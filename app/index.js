import clock from 'clock'
import document from 'document'
import { battery } from 'power'
import { me as device } from 'device'
import { vibration } from 'haptics'
import { peerSocket } from 'messaging'

import guhrliApp from 'fitbit-guhrli-core/app'

import { formatDate, getTimeStr, round } from '../common/utils'
import { LOW_BATTERY_LIMIT } from '../common/constants'
import { Settings } from './settings'

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

batteryStatusText.text = 'init'

guhrliApp.initialize(peerSocket)
// peerSocket.onmessage = guhrliApp.onMessage

function onTick(evt) {
  let now = evt ? evt.date : new Date()
  updateClock(now)
  updateDate(now)
  updateSecondTime(now) // weird
  updateBattery()
  updateConnectionStatus(now)
  updateReading()
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

function updateReading() {
  sgvText.text = guhrliApp.getReading()
  // this should be done by adding classes but I can't work out how to do that
  timeText.style.fill = colorMap[guhrliApp.getAlarm()] || colorMap.default
  sgvAgeText.text = guhrliApp.getFormattedAge() || ''
}

const colorMap = {
  default: '#007700',
  URGENT_HIGH: '#800000',
  HIGH: '#ff9900',
  LOW: '#1ac6ff',
  URGENT_LOW: '#0000bb'
}

peerSocket.onopen = function() {
  console.log('peersocket open')
}

peerSocket.onerror = function(err) {
  console.log(`Device ERROR: ${err.code} ${err.message}`)
}
