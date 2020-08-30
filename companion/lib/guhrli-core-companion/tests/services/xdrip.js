import test from 'ava'
import * as sinon from 'sinon'
import proxyquire from 'proxyquire'
import { sgvReading } from '../../classes/sgvReading'

const utilStub = {
  fetchJSON: sinon.stub().returns({
    settings: {
      units: 'mmol',
      thresholds: {
        bgHigh: 169,
        bgLow: 70
      }
    }
  })
}

const { XdripService } = proxyquire('../../services/xdrip', {
  '../utils': utilStub
})

test.afterEach(() => {
  utilStub.fetchJSON.resetHistory()
})

test.serial('.initialize() returns units and alarms correctly', async t => {
  const service = new XdripService()
  const { units, alarms } = await service.initialize()
  t.is(typeof units, 'string')
  t.is(typeof alarms, 'object')
  t.is(utilStub.fetchJSON.callCount, 1)
  t.is(utilStub.fetchJSON.lastCall.args[0], 'http://127.0.0.1:17580/status.json')
})

test.serial('.latestReading() returns an sgvReading', async t => {
  utilStub.fetchJSON.returns([{
    _id: '4110e897-8c5c-44db-b10b-139b4f551c24',
    device: 'Tomato',
    dateString: '2020-08-30T12:00:36.927+1000',
    sysTime: '2020-08-30T12:00:36.927+1000',
    date: 1598752836927,
    sgv: 141,
    delta: -19.008,
    direction: 'DoubleDown',
    noise: 1,
    filtered: 141000,
    unfiltered: 141000,
    rssi: 100,
    type: 'sgv',
    units_hint: 'mmol'
  }])
  const service = new XdripService()
  service.config.alarms = {}
  const res = await service.latestReading()
  t.is(res instanceof sgvReading, true)
  t.is(utilStub.fetchJSON.callCount, 1)
  t.is(utilStub.fetchJSON.lastCall.args[0], 'http://127.0.0.1:17580/sgv.json')
})
