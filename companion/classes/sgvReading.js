import { formatReading, getAlarmType } from '../utils'
import { ALARM_RULES } from '../config'

class sgvReading {
  constructor(valueMgdL, time, alarmRules = ALARM_RULES) {
    this.value = valueMgdL
    this.time = time
    this.alarm = getAlarmType(valueMgdL, alarmRules)
  }

  serialize(units) {
    return {
      type: 'guhrli',
      reading: formatReading(this.value, units),
      time: this.time,
      alarm: this.alarm
    }
  }

}

export  { sgvReading }
