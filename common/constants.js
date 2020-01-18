const ALARM_TYPES = {
  URGENT_HIGH: 'URGENT_HIGH',
  HIGH: 'HIGH',
  LOW: 'LOW',
  URGENT_LOW: 'URGENT_LOW'
}

const SETTINGS_EVENTS = {
  SHOW_BATTERY_STATUS: 'showBatteryStatus',
  SHOW_SECOND_TIME: 'showSecondTime',
  SECOND_TIME_OFFSET: 'secondTimeOffset',
  SHOW_SYNC_WARNING: 'showWarning',
  SYNC_WARNING_THRESHOLD: 'warningThreshold',
  PRIMARY_COLOR: 'primaryColor',
  PRIMARY_COLOR_CUSTOM: 'primaryColorCustom'
}

const DEFAULT_WARNING_THRESHOLD = 40
const LOW_BATTERY_LIMIT = 16 // below 17%, OS low battery icon is shown
const FETCH_FREQUENCY_MINS = 1

const UNITS = {
  MMOL: 'mmol',
  MGDL: 'mgdl'
}

export {
  ALARM_TYPES,
  SETTINGS_EVENTS,
  DEFAULT_WARNING_THRESHOLD,
  LOW_BATTERY_LIMIT,
  FETCH_FREQUENCY_MINS,
  UNITS
}
