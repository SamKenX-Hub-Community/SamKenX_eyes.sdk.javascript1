'use strict'

const path = require('path')
const cwd = process.cwd()
const testServer = require('../../src/test-server')
const {Target} = require(cwd)
const spec = require(path.resolve(cwd, 'src/SpecDriver'))
const {getEyes} = require('../../src/test-setup')

describe('TestVisualGridRefererHeader', () => {
  let testServer1, testServer2
  let driver

  before(async () => {
    const staticPath = path.join(__dirname, '../fixtures')
    testServer1 = await testServer({port: 5555, staticPath})
    testServer2 = await testServer({
      staticPath,
      port: 5556,
      allowCors: false,
      middlewareFile: path.resolve(__dirname, '../util/cors-middleware'),
    })
  })

  after(async () => {
    // await new Promise(r => setTimeout(r, 30000))
    await Promise.all([testServer1.close(), testServer2.close()])
  })

  beforeEach(async () => {
    driver = await spec.build({browser: 'chrome'})
  })

  afterEach(async () => {
    await spec.cleanup(driver)
  })

  it('send referer header', async () => {
    const url = 'http://localhost:5555/cors.html'
    await spec.visit(driver, url)
    const eyes = getEyes({isVisualGrid: true})
    await eyes.open(driver, 'VgFetch', ' VgFetch referer', {width: 800, height: 600})
    await eyes.check('referer', Target.window())
    await eyes.close()
  })
})
