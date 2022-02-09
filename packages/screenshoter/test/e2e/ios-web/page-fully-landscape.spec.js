const {makeDriver, sleep, test} = require('../e2e')

describe('screenshoter ios web', () => {
  const logger = {log: () => {}, warn: () => {}, error: () => {}, verbose: () => {}}
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({type: 'ios', app: 'safari', orientation: 'landscape', logger})
  })

  after(async () => {
    await destroyDriver()
  })

  it('take full page screenshot with landscape orientation', async () => {
    await driver.visit('https://applitools.github.io/demo/TestPages/PageWithBurgerMenu/')
    await sleep(5000)

    await test({
      type: 'ios-web',
      tag: 'page-fully-landscape',
      wait: 1500,
      fully: true,
      driver,
      logger,
    })
  })
})
