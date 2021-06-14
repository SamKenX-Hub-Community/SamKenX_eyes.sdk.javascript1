const {UniversalClient} = require('../../dist/universal-client')
const spec = require('../../dist/spec-driver')

describe('spec-driver', async () => {
  const [page, destroyPage] = await spec.build({browser: 'chrome', headless: true})
  const client = new UniversalClient()
  const results = await client.checkSpecDriver({driver: page})

  results.forEach(result =>
    it(result.test, function () {
      if (result.skipped) this.skip()
      if (result.error) throw new Error(result.error.message)
    }),
  )
  run()

  after(async () => {
    await destroyPage()
  })
})
