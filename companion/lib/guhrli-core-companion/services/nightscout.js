import { sgvReading } from '../classes/sgvReading'
import { sgvServiceBase } from './sgv-service-base'

import { fetchJSON } from '../utils'
import { UNITS } from '../consts'

class NightscoutService extends sgvServiceBase {
  constructor(url) {
    super()
    if (!url) {
      throw new Error('Missing nighstcout url in constructor')
    }
    this.url = url
    this.config = {}
    this.initialized = false
  }

  async initialize() {
    const { units, alarms }  = await queryStatus(this.url)
    // I don't understand why it thinks this is bad in this case, or how to fix it
    this.config.units = unitsMap[units] // eslint-disable-line require-atomic-updates
    this.config.alarms = alarms // eslint-disable-line require-atomic-updates
    return(this.config)
  }

  async latestReading() {
    const results =  await fetchJSON(`${this.url}api/v1/entries?count=1`)
    if (results.length == 0) return {}
    const { sgv, date } = results[0]
    return new sgvReading(sgv, date, this.config.alarms)
  }
}

async function queryStatus(url) {
  const { settings } =  await fetchJSON(`${url}api/v1/status.json`)
  const { units } = settings
  const alarms = getAlarms(settings)
  return { units, alarms }
}

function getAlarms(settings) {
  return {
    sgvHi: {
      enabled: settings.alarmUrgentHigh,
      threshold: settings.thresholds.bgHigh,
    },
    sgvTargetTop: {
      enabled: settings.alarmHigh,
      threshold: settings.thresholds.bgTargetTop,
    },
    sgvTargetBottom: {
      enabled: settings.alarmLow,
      threshold: settings.thresholds.bgTargetBottom
    },
    sgvLo: {
      enabled: settings.alarmUrgentLow,
      threshold: settings.thresholds.bgLow
    }
  }
}

const unitsMap = {
  'mmol': UNITS.MMOL,
  'mgdl': UNITS.MGDL
}

export {
  NightscoutService,
  getAlarms
}
