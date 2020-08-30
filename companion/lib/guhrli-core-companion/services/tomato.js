import { sgvReading } from '../classes/sgvReading'
import { sgvServiceBase } from './sgv-service-base'
import { UNITS } from '../consts'
import { fetchJSON } from '../utils'

const TOMATO_URL = 'http://127.0.0.1:11111'

class TomatoService extends sgvServiceBase {
  constructor() {
    super()
    this.units = ''
  }
  async initialize() {
    const res = fetchJSON(TOMATO_URL)
    const { bgs } = res
    const lastReading = bgs[0]
    if (lastReading.units_hint) this.units = unitsMap[lastReading.units_hint]
    console.log('tomato service initialized') // eslint-disable-line no-console
    return { units: this.units }
  }

  async latestReading() {
    console.log('fetching reading from tomato server') // eslint-disable-line no-console
    const res = fetchJSON(TOMATO_URL)
    const { bgs } = res
    const lastReading = bgs[0]
    if (!lastReading) return {}
    return new sgvReading(lastReading.sgv, lastReading.datetime)
  }
}

const unitsMap = {
  'mmol': UNITS.MMOL,
  'mgdl': UNITS.MGDL // todo: confirm what these actually look like in tomato
}


export {
  TomatoService
}
