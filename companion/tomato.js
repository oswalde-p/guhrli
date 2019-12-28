const TOMATO_URL = 'http://127.0.0.1:1111'

function queryTomatoReading() {
  console.log('inside queryTomatoReading')
  return { sgv: 200, age: 4 }
}

async function fetchJSON() {
  const res = await(fetch(TOMATO_URL))
  if (res.status == '200') return res.json()
  throw new Error(`Fetch Error \n  url: ${TOMATO_URL}\n  Status: ${res.status} ${res.statusText}` )
}

export {
  queryTomatoReading
}
