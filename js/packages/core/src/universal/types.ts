import type {Size, Region} from '@applitools/utils'
import type {Emitter, Listener, Client, Server} from '@applitools/socket'
import type {SpecType, DriverInfo, Cookie, WaitOptions} from '@applitools/driver'
import type * as MainCore from '../types'

/* eslint-disable prettier/prettier */
/**
 * Wraps the type with a ref if it vas to be refed
 */
type Refify<TValue> = TValue extends string | number | boolean | null | undefined ? TValue
  : TValue extends Array<infer TItem> ? Refify<TItem>[]
  : Extract<TValue[keyof TValue], (...args: any) => any> extends never ? TValue
  : Ref<TValue>

/**
 * Creates universalized object out of an ordinary interface:
 * - Filters out properties that are not of async function type
 * - Adds domain to the method names (`Domain.methodName`)
 * - Keep only first (`options`) argument of the methods
 * - Introduces additional option to the methods with a ref of the current instance
 * - Refifies return values of the methods
 */
type Universalize<TTarget extends Record<string, any>, TDomain extends string, TRefKey extends string = never> = {
  [TKey in keyof TTarget as NonNullable<TTarget[TKey]> extends (...args: any[]) => Promise<any> ? `${TDomain}.${TKey & string}` : never]:
    NonNullable<TTarget[TKey]> extends (options: infer TOptions) => Promise<infer TResult>
      ? (options: TOptions & {[TKey in TRefKey]: Ref<TTarget>}) => Promise<Refify<TResult>>
      : never
}
/* eslint-enable prettier/prettier */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type Ref<TValue = never> = {'applitools-ref-id': string; type?: string}

export type ClientSocket<TSpec extends SpecType, TType extends 'classic' | 'ufg'> = unknown &
  Emitter<Universalize<UniversalCore<TSpec, TType>, 'Core'>> &
  Client<Universalize<MainCore.Core<TSpec, TType>, 'Core'>> &
  Client<Universalize<MainCore.EyesManager<TSpec, TType>, 'EyesManager', 'manager'>> &
  Client<Universalize<MainCore.Eyes<TSpec, TType>, 'Eyes', 'eyes'>> &
  Client<Universalize<UniversalDebug<TSpec>, 'Debug'>> &
  Server<Universalize<UniversalSpecDriver<TSpec>, 'Driver'>>

export type ServerSocket<TSpec extends SpecType, TType extends 'classic' | 'ufg'> = unknown &
  Listener<Universalize<UniversalCore<TSpec, TType>, 'Core'>> &
  Emitter<Universalize<UniversalLogger, 'Logger'>> &
  Server<Universalize<MainCore.Core<TSpec, TType>, 'Core'>> &
  Server<Universalize<MainCore.EyesManager<TSpec, TType>, 'EyesManager', 'manager'>> &
  Server<Universalize<MainCore.Eyes<TSpec, TType>, 'Eyes', 'eyes'>> &
  Server<Universalize<UniversalDebug<TSpec>, 'Debug'>> &
  Client<Universalize<UniversalSpecDriver<TSpec>, 'Driver'>>

export interface UniversalCore<TSpec extends SpecType, TType extends 'classic' | 'ufg'> {
  makeCore(options: {
    agentId: string
    cwd: string
    spec: 'webdriver' | (keyof UniversalSpecDriver<TSpec>)[]
  }): Promise<MainCore.Core<TSpec, TType>>
}

export interface UniversalLogger {
  log(options: {level: string; message: string}): Promise<void>
}

export interface UniversalDebug<TSpec extends SpecType> {
  getHistory(): Promise<any>
  checkSpecDriver(options: {driver: TSpec['driver']; commands: (keyof UniversalSpecDriver<TSpec>)[]}): Promise<any>
}

/**
 * Ideally would be transform SpecDriver type to the type with single object argument
 * but typescript doesn't have a possibility to convert named tuples to object types at the moment
 */
export interface UniversalSpecDriver<T extends SpecType> {
  // #region UTILITY
  isEqualElements(options: {context: T['context']; element1: T['element']; element2: T['element']}): Promise<boolean>
  // #endregion

  // #region COMMANDS
  mainContext(options: {context: T['context']}): Promise<T['context']>
  parentContext(options: {context: T['context']}): Promise<T['context']>
  childContext(options: {context: T['context']; element: T['element']}): Promise<T['context']>
  executeScript(options: {context: T['context']; script: string; arg?: any}): Promise<any>
  findElement(options: {
    context: T['context']
    selector: T['selector']
    parent?: T['element']
  }): Promise<T['element'] | null>
  findElements(options: {
    context: T['context']
    selector: T['selector']
    parent?: T['element']
  }): Promise<T['element'][]>
  waitForSelector(options: {
    context: T['context']
    selector: T['selector']
    parent?: T['element']
    options?: WaitOptions
  }): Promise<T['element'] | null>
  setElementText(options: {context: T['context']; element: T['element']; text: string}): Promise<void>
  getElementText(options: {context: T['context']; element: T['element']}): Promise<string>
  setWindowSize(options: {driver: T['driver']; size: Size}): Promise<void>
  getWindowSize(options: {driver: T['driver']}): Promise<Size>
  setViewportSize(options: {driver: T['driver']; size: Size}): Promise<void>
  getViewportSize(options: {driver: T['driver']}): Promise<Size>
  getCookies(options: {driver: T['driver'] | T['context']; context?: boolean}): Promise<Cookie[]>
  getDriverInfo(options: {driver: T['driver']}): Promise<DriverInfo>
  getCapabilities(options: {driver: T['driver']}): Promise<Record<string, any>>
  getSessionMetadata(options: {driver: T['driver']}): Promise<any[] | null>
  getTitle(options: {driver: T['driver']}): Promise<string>
  getUrl(options: {driver: T['driver']}): Promise<string>
  takeScreenshot(options: {driver: T['driver']}): Promise<string>
  click(options: {context: T['context']; element: T['element'] | T['selector']}): Promise<void>
  visit(options: {driver: T['driver']; url: string}): Promise<void>
  // #endregion

  // #region MOBILE COMMANDS
  getOrientation(options: {
    driver: T['driver']
  }): Promise<'portrait' | 'landscape' | 'portrait-secondary' | 'landscape-secondary'>
  setOrientation(options: {
    driver: T['driver']
    orientation: 'portrait' | 'landscape' | 'portrait-secondary' | 'landscape-secondary'
  }): Promise<void>
  getSystemBars(options: {driver: T['driver']}): Promise<{
    statusBar: {visible: boolean; x: number; y: number; height: number; width: number}
    navigationBar: {visible: boolean; x: number; y: number; height: number; width: number}
  }>
  getElementRegion(options: {driver: T['driver']; element: T['element']}): Promise<Region>
  getElementAttribute(options: {driver: T['driver']; element: T['element']; attr: string}): Promise<string>
  performAction(options: {driver: T['driver']; steps: any[]}): Promise<void>
  getCurrentWorld(options: {driver: T['driver']}): Promise<string>
  getWorlds(options: {driver: T['driver']}): Promise<string[]>
  switchWorld(options: {driver: T['driver']; name: string}): Promise<void>
  // #endregion
}
