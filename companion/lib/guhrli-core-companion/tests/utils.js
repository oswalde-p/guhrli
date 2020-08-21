import test from 'ava'

import * as utils from'../utils'
import * as constants from '../consts'

test('formatReading with no units formats 105 as "105"', t => {
  const res = utils.formatReading(105)
  t.is(res, '105')
})

test('formatReading with units = mmol formats 105 as "5.8"', t => {
  const res = utils.formatReading(105, 'mmol')
  t.is(res, '5.8')
})

test('formatReading with units = mmol formats 108 as "6.0"', t => {
  const res = utils.formatReading(108, 'mmol')
  t.is(res, '6.0')
})

test('addSlash adds a slash to a simple string if it\'s missing', t => {
  const res = utils.addSlash('example.com')
  t.is(res, 'example.com/')
})

test('addSlash doesn\'t a slash to a simple string if it already ends with one', t => {
  const res = utils.addSlash('example.com/')
  t.is(res, 'example.com/')
})

test('addSlash adds a slash to a string if it contains slashes not in the last position', t => {
  const res = utils.addSlash('example.com/api')
  t.is(res, 'example.com/api/')
})

test('addSlash with empty string returns "/', t => {
  const res = utils.addSlash('')
  t.is(res, '/')
})

test('isValidUrl returns false for empty string', t => {
  const res = utils.isValidUrl('')
  t.is(res, false)
})

test('isValidUrl returns false for null', t => {
  const res = utils.isValidUrl(null)
  t.is(res, false)
})

test('isValidUrl returns false for undefined value', t => {
  const data = {}
  const res = utils.isValidUrl(data.url)
  t.is(res, false)
})

test('isValidUrl returns false for "fitbit.com"', t => {
  const res = utils.isValidUrl('fitbit.com')
  t.is(res, false)
})

test('isValidUrl returns true for "https://fitbit.com"', t => {
  const res = utils.isValidUrl('https://fitbit.com')
  t.is(res, true)
})

test('isValidUrl returns true for "https://fitbit.com/"', t => {
  const res = utils.isValidUrl('https://fitbit.com/')
  t.is(res, true)
})

test('isValidUrl returns false for "https://fitbit"', t => {
  const res = utils.isValidUrl('https://fitbit')
  t.is(res, false)
})

test('isValidUrl returns false for insecure "http://fitbit.com"', t => {
  const res = utils.isValidUrl('http://fitbit.com')
  t.is(res, false)
})

test('isValidUrl returns false for bad protocol "ws://fitbit.com"', t => {
  const res = utils.isValidUrl('ws://fitbit.com')
  t.is(res, false)
})

test('getAlarmType returns URGENT_HIGH for a value > rules.sgvHi', t => {
  const alarmRules = {
    sgvHi: { enabled: true, threshold: 260 },
    sgvLo: { enabled: true, threshold: 55 },
    sgvTargetBottom: { enabled: true, threshold: 80 },
    sgvTargetTop: { enabled: true, threshold: 180 }
  }
  const highValue = 270
  const res = utils.getAlarmType(highValue, alarmRules)
  t.is(res, constants.ALARM_TYPES.URGENT_HIGH)
})

test('getAlarmType returns HIGH for a value between targetTop and ruls.sgvHi', t => {
  const alarmRules = {
    sgvHi: { enabled: true, threshold: 260 },
    sgvLo: { enabled: true, threshold: 55 },
    sgvTargetBottom: { enabled: true, threshold: 80 },
    sgvTargetTop: { enabled: true, threshold: 180 }
  }
  const highValue = 200
  const res = utils.getAlarmType(highValue, alarmRules)
  t.is(res, constants.ALARM_TYPES.HIGH)
})


test('getAlarmType returns nothing for a value within target range', t => {
  const alarmRules = {
    sgvHi: { enabled: true, threshold: 260 },
    sgvLo: { enabled: true, threshold: 55 },
    sgvTargetBottom: { enabled: true, threshold: 80 },
    sgvTargetTop: { enabled: true, threshold: 180 }
  }
  const goodValue = 100
  const res = utils.getAlarmType(goodValue, alarmRules)
  t.true(typeof res === 'undefined')
})



test('getAlarmType returns LOW for a value between lo and targetBottom', t => {
  const alarmRules = {
    sgvHi: { enabled: true, threshold: 260 },
    sgvLo: { enabled: true, threshold: 55 },
    sgvTargetBottom: { enabled: true, threshold: 80 },
    sgvTargetTop: { enabled: true, threshold: 180 }
  }
  const lowValue = 75
  const res = utils.getAlarmType(lowValue, alarmRules)
  t.is(res, constants.ALARM_TYPES.LOW)
})



test('getAlarmType returns URGENT_HIGH for a value < sgvLo', t => {
  const alarmRules = {
    sgvHi: { enabled: true, threshold: 260 },
    sgvLo: { enabled: true, threshold: 55 },
    sgvTargetBottom: { enabled: true, threshold: 80 },
    sgvTargetTop: { enabled: true, threshold: 180 }
  }
  const lowValue = 50
  const res = utils.getAlarmType(lowValue, alarmRules)
  t.is(res, constants.ALARM_TYPES.URGENT_LOW)
})


test('getAlarmType returns LOW for a value < lo and urgent low alarms disabled', t => {
  const alarmRules = {
    sgvHi: { enabled: true, threshold: 260 },
    sgvLo: { enabled: false, threshold: 55 },
    sgvTargetBottom: { enabled: true, threshold: 80 },
    sgvTargetTop: { enabled: true, threshold: 180 }
  }
  const lowValue = 50
  const res = utils.getAlarmType(lowValue, alarmRules)
  t.is(res, constants.ALARM_TYPES.LOW)
})

