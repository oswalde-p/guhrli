import { ALARM_TYPES } from './consts'

export function addSlash(str) {
  if (str.slice(-1) == '/') return str
  return `${str}/`
}
function isValidUrl(str) {
  if (!str) return false
  const [ protocol, tail ] = str.split('://')
  if (!protocol || protocol !== 'https' || !tail) return false
  const parts = tail.split('.')
  if (parts.length < 2) return false // must have at least host + tld
  return true
}

function formatReading(sgvVal, units) {
  if (!units || units != 'mmol') {
    return String(sgvVal)
  }
  const readingMmol = sgvVal / 18
  return (Math.round(readingMmol * 10) / 10).toFixed(1)
}

function getAlarmType(sgvVal, alarmRules) {
  if (alarmRules.sgvHi && alarmRules.sgvHi.enabled && sgvVal > alarmRules.sgvHi.threshold) {
    return ALARM_TYPES.URGENT_HIGH
  } else if (alarmRules.sgvTargetTop && alarmRules.sgvTargetTop.enabled && sgvVal > alarmRules.sgvTargetTop.threshold) {
    return ALARM_TYPES.HIGH
  } else if (alarmRules.sgvLo && alarmRules.sgvLo.enabled && sgvVal < alarmRules.sgvLo.threshold) {
    return ALARM_TYPES.URGENT_LOW
  } else if (alarmRules.sgvTargetBottom && alarmRules.sgvTargetBottom.enabled && sgvVal < alarmRules.sgvTargetBottom.threshold) {
    return ALARM_TYPES.LOW
  }
  return
}

async function fetchJSON(url) {
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Cache-control': 'no-cache'
    }
  })
  if (res.status == '200') return res.json()
  throw new Error(`Fetch Error \n  url: ${url}\n  Status: ${res.status} ${res.statusText}` )
}

export {
  fetchJSON,
  formatReading,
  getAlarmType,
  isValidUrl
}
