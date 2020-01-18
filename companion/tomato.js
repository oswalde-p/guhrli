import { sgvReading } from './classes/sgvReading'

const TOMATO_URL = 'http://127.0.0.1:11111'

async function queryTomatoReading() {
  console.log('fetching reading from tomato server')
  const res = await fetchJSON()
  const { bgs } = res
  const lastReading = bgs[0]
  if (!lastReading) return {}
  return new sgvReading(lastReading.sgv, lastReading.datetime)
}

async function fetchJSON() {
  try {
    const res = await(fetch(TOMATO_URL))
    if (res.status == '200') return res.json()
    console.error('Error fetching data!')
    throw new Error(`Fetch Error \n  url: ${TOMATO_URL}\n  Status: ${res.status} ${res.statusText}` )
  } catch(err) {
    console.log(err)
  }
}

export {
  queryTomatoReading,
  fetchJSON
}
