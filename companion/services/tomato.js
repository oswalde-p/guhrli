import { sgvReading } from '../classes/sgvReading'
import { sgvServiceBase } from './sgv-service-base'
import { UNITS } from '../../common/constants'

const TOMATO_URL = 'http://127.0.0.1:11111'

class TomatoService extends sgvServiceBase {
  constructor() {
    super()
    this.units = ''
  }
  async initialize() {
    const res = await this.fetchJSON()
    const { bgs } = res
    const lastReading = bgs[0]
    if (lastReading.units_hint) this.units = unitsMap[lastReading.units_hint]
    console.log('tomato service initialized') // eslint-disable-line no-console
    return { units: this.units }
  }

  async latestReading() {
    console.log('fetching reading from tomato server') // eslint-disable-line no-console
    const res = await this.fetchJSON()
    const { bgs } = res
    const lastReading = bgs[0]
    if (!lastReading) return {}
    return new sgvReading(lastReading.sgv, lastReading.datetime)
  }

  async fetchJSON() {
    try {
      const res = await(fetch(TOMATO_URL))
      if (res.status == '200') return res.json()
      console.error('Error fetching data!') // eslint-disable-line no-console
      throw new Error(`Fetch Error \n  url: ${TOMATO_URL}\n  Status: ${res.status} ${res.statusText}` )
    } catch(err) {
      console.log(err) // eslint-disable-line no-console
    }
  }
}

const unitsMap = {
  'mmol': UNITS.MMOL,
  'mgdl': UNITS.MGDL // todo: confirm what these actually look like in tomato
}


export {
  TomatoService
}
