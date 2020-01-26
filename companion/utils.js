import { ALARM_TYPES } from '../common/constants'

function isValidUrl(str) {
  if (!str) return false
  const [ protocol, tail ] = str.split('://')
  if (!protocol || protocol !== 'https' || !tail) return false
  const parts = tail.split('.')
  if (parts.length < 2) return false // must have at least host + tld
  return true
}

function addSlash(str) {
  if (str.slice(-1) == '/') return str
  return `${str}/`
}


function formatReading(sgvVal, units) {
  if (!units || units != 'mmol') {
    return String(sgvVal)
  }
  const readingMmol = sgvVal / 18
  return (Math.round(readingMmol * 10) / 10).toFixed(1)
}

function getAlarmType(sgvVal, alarmRules) {
  if (alarmRules.sgvHi.enabled && sgvVal > alarmRules.sgvHi.threshold) {
    return ALARM_TYPES.URGENT_HIGH
  } else if (alarmRules.sgvTargetTop.enabled && sgvVal > alarmRules.sgvTargetTop.threshold) {
    return ALARM_TYPES.HIGH
  } else if (alarmRules.sgvLo.enabled && sgvVal < alarmRules.sgvLo.threshold) {
    return ALARM_TYPES.URGENT_LOW
  } else if (alarmRules.sgvTargetBottom.enabled && sgvVal < alarmRules.sgvTargetBottom.threshold) {
    return ALARM_TYPES.LOW
  }
  return
}

export {
  addSlash,
  formatReading,
  getAlarmType,
  isValidUrl
}
