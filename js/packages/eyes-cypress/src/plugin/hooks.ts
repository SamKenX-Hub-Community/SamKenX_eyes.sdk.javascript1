import handleTestResults from './handleTestResults'
export type EyesCypressAction = 'before:run' | 'after:run'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface ResolvedConfigOptions {
      appliConfFile: {
        dontCloseBatches: boolean
        batch: any
        serverUrl: string
        proxy: string
        apiKey: string
        batchId: string
        tapDirPath: string
        tapFileName: string
      }
    }
  }
}

export default function makeGlobalRunHooks({closeManager, closeBatches, closeUniversalServer}: any): {
  'after:run': (results: CypressCommandLine.CypressRunResult) => void | Promise<void>
  'before:run': (runDetails: Cypress.BeforeRunDetails) => void | Promise<void>
} {
  return {
    'before:run': ({config}: Cypress.BeforeRunDetails): void => {
      if (!(config as Cypress.Config).isTextTerminal) return
    },

    'after:run': async ({config}: CypressCommandLine.CypressRunResult) => {
      try {
        if (!(config as Cypress.Config).isTextTerminal) return
        const summaries = await closeManager()

        let testResults
        for (const summary of summaries) {
          testResults = summary.results.map(({testResults}: any) => testResults)
        }
        if (!config.appliConfFile.dontCloseBatches) {
          await closeBatches({
            batchIds: [config.appliConfFile.batchId || config.appliConfFile.batch.id],
            serverUrl: config.appliConfFile.serverUrl,
            proxy: config.appliConfFile.proxy,
            apiKey: config.appliConfFile.apiKey,
          })
        }

        if (config.appliConfFile.tapDirPath) {
          await handleTestResults.handleBatchResultsFile(testResults, {
            tapDirPath: config.appliConfFile.tapDirPath,
            tapFileName: config.appliConfFile.tapFileName,
          })
        }
      } finally {
        await closeUniversalServer()
      }
    },
  }
}
