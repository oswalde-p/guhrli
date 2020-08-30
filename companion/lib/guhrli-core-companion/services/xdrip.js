import { sgvReading } from '../classes/sgvReading'
import { sgvServiceBase } from './sgv-service-base'
import { fetchJSON } from '../utils'

const URL_BASE = 'http://127.0.0.1:17580'

class XdripService extends sgvServiceBase {
  constructor() {
    super()
    this.config = {}
  }

  async initialize() {
    console.log('Initializing xDrip+ service')
    const { units, alarms }  = await queryStatus()
    console.log(`Units: ${units}, Alarms: ${alarms}`)
    this.config.alarms = alarms
    return { units, alarms }
  }

  async latestReading() {
    console.log('Fetching reading from xDrip')
    const results =  await fetchJSON(`${URL_BASE}/sgv.json`)
    if (results.length == 0) return {}
    const { sgv, date } = results[0]
    console.log(sgv)
    return new sgvReading(sgv, date, this.config.alarms)
  }

}

async function queryStatus() {
  const { settings } =  await fetchJSON(`${URL_BASE}/status.json`)
  const { units, thresholds } = settings
  const alarms = {
    sgvTargetTop: {
      enabled: true,
      threshold: thresholds.bgHigh,
    },
    sgvTargetBottom: {
      enabled: true,
      threshold: thresholds.bgLow,
    }
  }
  return { units, alarms }
}

export {
  XdripService
}
