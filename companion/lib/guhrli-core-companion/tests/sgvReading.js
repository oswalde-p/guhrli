import test from 'ava'

import { sgvReading } from '../classes/sgvReading'
import { ALARM_TYPES, UNITS } from '../consts'

test('sgv constructor with no alarmRules uses default', t => {
  let reading = new sgvReading(100, 1577570350680)
  t.true(typeof reading.alarm === 'undefined')

  reading = new sgvReading(200, 1577570350680)
  t.is(reading.alarm, ALARM_TYPES.HIGH)

  reading = new sgvReading(260, 1577570350680)
  t.is(reading.alarm, ALARM_TYPES.URGENT_HIGH)
})

test('sgvReading.serialize() returns results in mgdl by default', t => {
  const reading = new sgvReading(100, 1577570350680)
  const serialized = reading.serialize()
  t.is(serialized.reading, '100')
})

test('sgvReading.serialize(MMOL) returns results in mmol', t => {
  const reading = new sgvReading(100, 1577570350680)
  const serialized = reading.serialize(UNITS.MMOL)
  t.is(serialized.reading, '5.6')
})

test('sgvReading.serialize(MGDL) returns results in mgdl', t => {
  const reading = new sgvReading(100, 1577570350680)
  const serialized = reading.serialize(UNITS.MGDL)
  t.is(serialized.reading, '100')
})

test('format of sgvReading.serialize()', t => {
  const reading = new sgvReading(200, 1577570350680)
  const serialized = reading.serialize()
  t.is(typeof serialized.reading, 'string')
  t.is(typeof serialized.alarm, 'string')
  t.is(typeof serialized.time, 'number')
})

