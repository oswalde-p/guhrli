import test from 'ava'
import { tomatoService } from '../companion/services/tomato'

test('latestReading is a function', t => {
  const service = new tomatoService()
  t.is(typeof service.latestReading, 'function')
})
