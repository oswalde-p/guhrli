import { formatReading, getAlarmType } from '../utils'
import { ALARM_RULES } from '../config'

class sgvReading {
  constructor(valueMgdL, time, alarmRules = ALARM_RULES) {
    this.value = valueMgdL
    this.time = time
    this.alarm = getAlarmType(valueMgdL, alarmRules)
  }

  value(units) {
    return formatReading(this.value, units)
  }

  mgdl() {
    return formatReading(this.value)
  }

  mmol() {
    return formatReading(this.value, 'mmol')
  }

  serialize(units) {
    return {
      reading: formatReading(this.value, units),
      time: this.time
    }
  }

}

export  { sgvReading }
