import * as spec from '@applitools/spec-driver-webdriverio'
import {makeCore} from '../../src/index'

describe('typed check', () => {
  let driver: spec.Driver, destroyDriver: () => Promise<void>

  before(async () => {
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
  })

  after(async () => {
    await destroyDriver?.()
  })

  it('performs classic check during ufg test', async () => {
    await driver.url('https://applitools.github.io/demo/TestPages/PageWithBurgerMenu/index.html')

    const core = makeCore({spec})
    const manager = await core.makeManager({type: 'ufg'})
    const eyes = await manager.openEyes({
      target: driver,
      settings: {appName: 'core e2e', testName: 'classic check in ufg test'},
    })

    await eyes.check({
      settings: {
        name: 'default ufg step',
        fully: false,
        renderers: [
          {name: 'chrome', width: 800, height: 600},
          {name: 'safari', width: 800, height: 600},
        ],
        hooks: {
          beforeCaptureScreenshot: `document.body.style.background = 'blue'`,
        },
      },
    })
    await eyes.check({
      type: 'classic',
      settings: {
        name: 'classic step',
        fully: false,
        renderers: [
          {name: 'chrome', width: 800, height: 600},
          {name: 'safari', width: 800, height: 600},
        ],
        hooks: {
          beforeCaptureScreenshot: `document.body.style.background = 'maroon'`,
        },
      },
    })
    await eyes.check({
      type: 'ufg',
      settings: {
        name: 'ufg step',
        fully: false,
        renderers: [
          {name: 'chrome', width: 800, height: 600},
          {name: 'safari', width: 800, height: 600},
        ],
        hooks: {
          beforeCaptureScreenshot: `document.body.style.background = 'maroon'`,
        },
      },
    })

    await eyes.close()
    await eyes.getResults({settings: {throwErr: true}})
  })

  it.skip('performs ufg check during classic test', async () => {
    await driver.url('https://applitools.github.io/demo/TestPages/PageWithBurgerMenu/index.html')

    const core = makeCore({spec})
    const manager = await core.makeManager({type: 'classic'})
    const eyes = await manager.openEyes({
      target: driver,
      settings: {appName: 'core e2e', testName: 'classic check during ufg test'},
    })

    await eyes.check({
      settings: {name: 'default classic step', fully: false},
    })
    await eyes.check({
      type: 'ufg',
      settings: {name: 'ufg step', fully: false},
    })
    await eyes.check({
      type: 'classic',
      settings: {name: 'classic step', fully: false},
    })

    await eyes.close()
    await eyes.getResults({settings: {throwErr: true}})
  })
})
