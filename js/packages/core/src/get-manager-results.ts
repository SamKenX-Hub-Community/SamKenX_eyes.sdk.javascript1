import type {
  Core,
  Eyes,
  GetResultsSettings,
  CloseBatchSettings,
  TestResult,
  TestResultContainer,
  TestResultSummary,
} from './types'
import {type SpecType} from '@applitools/driver'
import {type Logger} from '@applitools/logger'
import {TestError} from './errors/test-error'
import {InternalError} from './errors/internal-error'

type Options<TSpec extends SpecType, TType extends 'classic' | 'ufg'> = {
  core: Core<TSpec>
  storage: Eyes<TSpec, TType>[]
  logger: Logger
}

export function makeGetManagerResults<TSpec extends SpecType, TType extends 'classic' | 'ufg'>({
  core,
  storage,
  logger: defaultLogger,
}: Options<TSpec, TType>) {
  return async function getManagerResults({
    settings,
    logger = defaultLogger,
  }: {
    settings?: GetResultsSettings<TType>
    logger?: Logger
  } = {}): Promise<TestResultSummary<TType>> {
    const containers: TestResultContainer<TType>[][] = await Promise.all(
      storage.map(async eyes => {
        try {
          const results = await eyes.getResults({settings: {...settings, throwErr: false}, logger})
          return results.map(result => {
            return {
              result,
              error: result.status !== 'Passed' ? new TestError(result) : undefined,
              userTestId: result.userTestId,
              renderer: (result as TestResult<'ufg'>).renderer,
            }
          })
        } catch (error: any) {
          return [{error: new InternalError(error), ...error.info}]
        }
      }),
    )

    const batches = storage.reduce((batches, eyes) => {
      if (!eyes.test.keepBatchOpen) {
        const settings = {...eyes.test.server, batchId: eyes.test.batchId}
        batches[`${settings.serverUrl}:${settings.apiKey}:${settings.batchId}`] = settings
      }
      return batches
    }, {} as Record<string, CloseBatchSettings>)

    await core.closeBatch({settings: Object.values(batches), logger}).catch(() => null)

    const summary = {
      results: containers.flat(),
      passed: 0,
      unresolved: 0,
      failed: 0,
      exceptions: 0,
      mismatches: 0,
      missing: 0,
      matches: 0,
    }

    for (const container of summary.results) {
      if (container.error) {
        if (settings?.throwErr) throw container.error
        summary.exceptions += 1
      }

      if (container.result) {
        if (container.result.status === 'Failed') summary.failed += 1
        else if (container.result.status === 'Passed') summary.passed += 1
        else if (container.result.status === 'Unresolved') summary.unresolved += 1

        summary.matches += container.result.matches ?? 0
        summary.missing += container.result.missing ?? 0
        summary.mismatches += container.result.mismatches ?? 0
      }
    }

    return summary
  }
}
