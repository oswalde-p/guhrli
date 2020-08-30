import test from 'ava'
import * as sinon from 'sinon'
import proxyquire from 'proxyquire'

const utilStub = {
  fetchJSON: sinon.stub().returns({
    status: [
      {
        now: 1577570350680
      }
    ],
    bgs: [
      {
        device: 'miaomiao',
        datetime: 1579995390265,
        sgv: 90,
        type: 'sgv',
        battery: 10,
        delta: 0,
        units_hint: 'mgdl'
      }
    ],
    cals: []
  })
}

const { TomatoService } = proxyquire('../../services/tomato', {
  '../utils': utilStub
})

test.afterEach(() => {
  utilStub.fetchJSON.resetHistory()
})

test.serial('.initialize() returns units correctly', async t => {
  const service = new TomatoService()
  const { units } = await service.initialize()
  t.is(units, 'mgdl')
  t.is(utilStub.fetchJSON.callCount, 1)
  t.is(utilStub.fetchJSON.lastCall.args[0], 'http://127.0.0.1:11111')
})

test.serial('.latestReading() returns a reading', async t => {
  const service = new TomatoService()
  const res = await service.latestReading()
  t.is(res.value, 90)
  t.is(res.time, 1579995390265)
  t.is(utilStub.fetchJSON.callCount, 1)
  t.is(utilStub.fetchJSON.lastCall.args[0], 'http://127.0.0.1:11111')
})
