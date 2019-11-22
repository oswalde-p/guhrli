function isValidUrl(str) {
  if (!str) return false
  const [ protocol, tail ] = str.split('://')
  if (!protocol || protocol !== 'https' || !tail) return false
  const parts = tail.split('.')
  if (parts.length < 2) return false // must have at least host + tld
  return true
}

function addSlash(str) {
  if (str.slice(-1) == '/') return str
  return `${str}/`
}


function formatReading(sgvVal, units) {
  if (!units || units != 'mmol') {
    return String(sgvVal)
  }
  const readingMmol = sgvVal / 18
  return (Math.round(readingMmol * 10) / 10).toFixed(1)
}

export {
  addSlash,
  formatReading,
  isValidUrl
}
