
async function queryStatus(urlBase) {
  if (!urlBase) return {}
  const { settings } =  await fetchJSON(`${urlBase}api/v1/status.json`)
  const { units } = settings
  const alarms = getAlarms(settings)
  return { units, alarms }
}

async function queryLastReading(urlBase){
  if (!urlBase) return {}
  const results =  await fetchJSON(`${urlBase}api/v1/entries?count=1`)
  if (results.length == 0) return {}
  const { sgv, date } = results[0]
  const age = Math.round((new Date() - date) / (60 * 1000))
  return { sgv, age}
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

export {
  queryLastReading,
  queryStatus
}
