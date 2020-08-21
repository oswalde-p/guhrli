import test from 'ava'
import { TomatoService } from '../services/tomato'

test('latestReading is a function', t => {
  const service = new TomatoService()
  t.is(typeof service.latestReading, 'function')
})
