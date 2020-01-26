import { sgvReading } from '../classes/sgvReading'
import { sgvServiceBase } from './sgv-service-base'

import { UNITS } from '../../common/constants'

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
    const { units, alarms }  = await this._queryStatus()
    // I don't understand why it thinks this is bad in this case, or how to fix it
    this.config.units = unitsMap[units] // eslint-disable-line require-atomic-updates
    this.config.alarms = alarms // eslint-disable-line require-atomic-updates
    console.log('nightscout service initialized') // eslint-disable-line no-console
    return(this.config)
  }

  async latestReading() {
    const results =  await fetchJSON(`${this.url}api/v1/entries?count=1`)
    if (results.length == 0) return {}
    const { sgv, date } = results[0]
    return new sgvReading(sgv, date, this.config.alarms)
  }

  async  _queryStatus() {
    const { settings } =  await fetchJSON(`${this.url}api/v1/status.json`)
    const { units } = settings
    const alarms = getAlarms(settings)
    return { units, alarms }
  }
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

function getAlarms(settings) {
  return {
    sgvHi: {
      enabled: settings.alarmUrgentHigh,
      threshold: settings.thresholds.bgHigh,
    },
    sgvTargetTop: {
      enabled: settings.alarmUrgentHigh,
      threshold: settings.thresholds.bgTargetTop,
    },
    sgvTargetBottom: {
      enabled: settings.alarmUrgentHigh,
      threshold: settings.thresholds.bgTargetBottom
    },
    sgvLo: {
      enabled: settings.alarmUrgentHigh,
      threshold: settings.thresholds.bgLow
    }
  }
}

const unitsMap = {
  'mmol': UNITS.MMOL,
  'mgdl': UNITS.MGDL
}

export {
  NightscoutService
}
