export default {
  'status': 'ok',
  'name': 'nightscout',
  'version': '0.12.2',
  'serverTime': '2020-08-30T03:11:15.214Z',
  'serverTimeEpoch': 1598757075214,
  'apiEnabled': true,
  'careportalEnabled': true,
  'boluscalcEnabled': false,
  'settings': {
    'units': 'mmol',
    'timeFormat': 12,
    'nightMode': false,
    'editMode': true,
    'showRawbg': 'never',
    'customTitle': 'Nightscout',
    'theme': 'colors',
    'alarmUrgentHigh': true,
    'alarmUrgentHighMins': [
      30,
      60,
      90,
      120
    ],
    'alarmHigh': true,
    'alarmHighMins': [
      30,
      60,
      90,
      120
    ],
    'alarmLow': true,
    'alarmLowMins': [
      15,
      30,
      45,
      60
    ],
    'alarmUrgentLow': true,
    'alarmUrgentLowMins': [
      15,
      30,
      45
    ],
    'alarmUrgentMins': [
      30,
      60,
      90,
      120
    ],
    'alarmWarnMins': [
      30,
      60,
      90,
      120
    ],
    'alarmTimeagoWarn': true,
    'alarmTimeagoWarnMins': '15',
    'alarmTimeagoUrgent': true,
    'alarmTimeagoUrgentMins': '30',
    'alarmPumpBatteryLow': false,
    'language': 'en',
    'scaleY': 'log',
    'showPlugins': 'careportal delta direction upbat',
    'showForecast': 'ar2',
    'focusHours': 3,
    'heartbeat': 60,
    'baseURL': '',
    'authDefaultRoles': 'readable',
    'thresholds': {
      'bgHigh': 260,
      'bgTargetTop': 180,
      'bgTargetBottom': 80,
      'bgLow': 55
    },
    'insecureUseHttp': false,
    'secureHstsHeader': true,
    'secureHstsHeaderIncludeSubdomains': false,
    'secureHstsHeaderPreload': false,
    'secureCsp': false,
    'DEFAULT_FEATURES': [
      'bgnow',
      'delta',
      'direction',
      'timeago',
      'devicestatus',
      'upbat',
      'errorcodes',
      'profile'
    ],
    'alarmTypes': [
      'simple'
    ],
    'enable': [
      'careportal',
      'basal',
      'treatmentnotify',
      'bgnow',
      'delta',
      'direction',
      'timeago',
      'devicestatus',
      'upbat',
      'errorcodes',
      'profile',
      'simplealarms'
    ]
  },
  'extendedSettings': {
    'devicestatus': {
      'advanced': true
    }
  },
  'authorized': null
}