import test from 'ava'
import * as tomatoService from '../companion/tomato'

test('queryTomatoReading is a function', async t => {
  t.is(typeof tomatoService.queryTomatoReading, 'function')
})
