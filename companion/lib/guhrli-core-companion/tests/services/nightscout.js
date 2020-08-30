import test from 'ava'
import * as sinon from 'sinon'
import proxyquire from 'proxyquire'
import statusFixture from './fixture/_nightscout-status'
import readingFixture from './fixture/_nightscout-reading'

const utilStub = {
  fetchJSON: sinon.stub().returns(statusFixture)
}


const { getAlarms, NightscoutService } = proxyquire('../../services/nightscout', {
  '../utils': utilStub
})

test.afterEach(() => {
  utilStub.fetchJSON.resetHistory()
})

test('constructor throws error if no URL provided', t => {
  const error = t.throws(() => new NightscoutService())
  t.is(error.message, 'Missing nighstcout url in constructor')
})

test.serial('.initialize() returns units and alarms correctly', async t => {
  const url = 'https://test.com/'
  const service = new NightscoutService(url)
  const { units, alarms } = await service.initialize()
  t.is(units, 'mmol')
  t.is(typeof alarms, 'object')
  t.is(alarms.sgvHi.enabled, true)
  t.is(alarms.sgvHi.threshold, 260)
  t.is(alarms.sgvTargetTop.enabled, true)
  t.is(alarms.sgvTargetTop.threshold, 180)
  t.is(alarms.sgvTargetBottom.enabled, true)
  t.is(alarms.sgvTargetBottom.threshold, 80)
  t.is(alarms.sgvLo.enabled, true)
  t.is(alarms.sgvLo.threshold, 55)
  t.is(utilStub.fetchJSON.callCount, 1)
  t.is(utilStub.fetchJSON.lastCall.args[0], 'https://test.com/api/v1/status.json')
  utilStub.fetchJSON.resetHistory()
})

test.serial('.latestReading() returns an sgvReading', async t => {
  utilStub.fetchJSON.returns(readingFixture)
  const url = 'https://test.com/'
  const service = new NightscoutService(url)
  service.config.alarms = {}
  const res = await service.latestReading()
  t.is(res.value, 201)
  t.is(res.time, 1598763209167)
  t.is(utilStub.fetchJSON.callCount, 1)
  t.is(utilStub.fetchJSON.lastCall.args[0], 'https://test.com/api/v1/entries?count=1')
})

test.serial('.latestReading() returns URGENT_HIGH alarm for very high reading', async t => {
  utilStub.fetchJSON.returns([
    {
      sgv: 260,
      date: 1598763209167
    }
  ])
  const url = 'https://test.com/'
  const service = new NightscoutService(url)
  service.config.alarms = {
    sgvHi: {
      enabled: true,
      threshold: 250,
    },
    sgvTargetTop: {
      enabled: true,
      threshold: 180,
    },
    sgvTargetBottom: {
      enabled: true,
      threshold: 70
    },
    sgvLo: {
      enabled: true,
      threshold: 40
    }
  }
  const res = await service.latestReading()
  t.is(res.alarm, 'URGENT_HIGH')
})

test.serial('.latestReading() returns high alarm for high reading', async t => {
  utilStub.fetchJSON.returns([
    {
      sgv: 200,
      date: 1598763209167
    }
  ])
  const url = 'https://test.com/'
  const service = new NightscoutService(url)
  service.config.alarms = {
    sgvHi: {
      enabled: true,
      threshold: 250,
    },
    sgvTargetTop: {
      enabled: true,
      threshold: 180,
    },
    sgvTargetBottom: {
      enabled: true,
      threshold: 70
    },
    sgvLo: {
      enabled: true,
      threshold: 40
    }
  }
  const res = await service.latestReading()
  t.is(res.alarm, 'HIGH')
})

test.serial('.latestReading() returns no alarm for good reading', async t => {
  utilStub.fetchJSON.returns([
    {
      sgv: 100,
      date: 1598763209167
    }
  ])
  const url = 'https://test.com/'
  const service = new NightscoutService(url)
  service.config.alarms = {
    sgvHi: {
      enabled: true,
      threshold: 250,
    },
    sgvTargetTop: {
      enabled: true,
      threshold: 180,
    },
    sgvTargetBottom: {
      enabled: true,
      threshold: 70
    },
    sgvLo: {
      enabled: true,
      threshold: 40
    }
  }
  const res = await service.latestReading()
  t.is(res.alarm, undefined)
})

test.serial('.latestReading() returns low alarm for low reading', async t => {
  utilStub.fetchJSON.returns([
    {
      sgv: 60,
      date: 1598763209167
    }
  ])
  const url = 'https://test.com/'
  const service = new NightscoutService(url)
  service.config.alarms = {
    sgvHi: {
      enabled: true,
      threshold: 250,
    },
    sgvTargetTop: {
      enabled: true,
      threshold: 180,
    },
    sgvTargetBottom: {
      enabled: true,
      threshold: 70
    },
    sgvLo: {
      enabled: true,
      threshold: 40
    }
  }
  const res = await service.latestReading()
  t.is(res.alarm, 'LOW')
})

test.serial('.latestReading() returns URGENT_LOW alarm for very low reading', async t => {
  utilStub.fetchJSON.returns([
    {
      sgv: 35,
      date: 1598763209167
    }
  ])
  const url = 'https://test.com/'
  const service = new NightscoutService(url)
  service.config.alarms = {
    sgvHi: {
      enabled: true,
      threshold: 250,
    },
    sgvTargetTop: {
      enabled: true,
      threshold: 180,
    },
    sgvTargetBottom: {
      enabled: true,
      threshold: 70
    },
    sgvLo: {
      enabled: true,
      threshold: 40
    }
  }
  const res = await service.latestReading()
  t.is(res.alarm, 'URGENT_LOW')
})

test('getAlarms parses settings object correclty', t => {
  const settings = {
    alarmUrgentHigh: true,
    alarmHigh: true,
    alarmLow: true,
    alarmUrgentLow: true,
    thresholds: {
      bgHigh: 260,
      bgTargetTop: 180,
      bgTargetBottom: 80,
      bgLow: 55
    }
  }

  let alarms = getAlarms(settings)
  t.is(alarms.sgvHi.enabled, true)
  t.is(alarms.sgvHi.threshold, 260)
  t.is(alarms.sgvTargetTop.enabled, true)
  t.is(alarms.sgvTargetTop.threshold, 180)
  t.is(alarms.sgvTargetBottom.enabled, true)
  t.is(alarms.sgvTargetBottom.threshold, 80)
  t.is(alarms.sgvLo.enabled, true)
  t.is(alarms.sgvLo.threshold, 55)

  settings.alarmUrgentHigh = false
  alarms = getAlarms(settings)
  t.is(alarms.sgvHi.enabled, false)
  t.is(alarms.sgvTargetTop.enabled, true)
  t.is(alarms.sgvTargetBottom.enabled, true)
  t.is(alarms.sgvLo.enabled, true)
})
