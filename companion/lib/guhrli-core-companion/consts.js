const ALARM_TYPES = {
  URGENT_HIGH: 'URGENT_HIGH',
  HIGH: 'HIGH',
  LOW: 'LOW',
  URGENT_LOW: 'URGENT_LOW'
}

const SETTINGS_EVENTS = {
  BG_SOURCE: 'bgSource',
  NIGHTSCOUT_URL: 'nightscoutUrl'
}

const FETCH_FREQUENCY_MINS = 1

const BG_SOURCES = {
  NONE: 0,
  NIGHTSCOUT: 1,
  TOMATO: 2,
  XDRIP: 3
}


const UNITS = {
  MMOL: 'mmol',
  MGDL: 'mgdl'
}

export {
  ALARM_TYPES,
  BG_SOURCES,
  FETCH_FREQUENCY_MINS,
  SETTINGS_EVENTS,
  UNITS
}
