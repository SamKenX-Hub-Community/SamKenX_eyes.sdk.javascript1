import type {Location, Size, Region} from '@applitools/utils'
import type {ScreenOrientation, Cookie} from './types'
import {type CommonSelector} from './selector'

export type SpecType<TDriver = unknown, TContext = unknown, TElement = unknown, TSelector = unknown> = {
  driver: TDriver
  context: TContext
  element: TElement
  selector: TSelector
}

export interface SpecDriver<T extends SpecType> {
  // #region UTILITY
  isDriver(driver: any): driver is T['driver']
  isContext?(context: any): context is T['context']
  isElement(element: any): element is T['element']
  isSelector(selector: any): selector is T['selector']
  transformDriver?(driver: any): T['driver']
  transformElement?(element: any): T['element']
  transformSelector?(selector: CommonSelector<T['selector']> | T['selector']): T['selector']
  untransformSelector?(selector: T['selector']): CommonSelector | null
  extractContext?(element: T['driver'] | T['context']): T['context']
  extractSelector?(element: T['element']): T['selector']
  isStaleElementError(error: any, selector?: T['selector']): boolean
  isEqualElements?(context: T['context'], element1: T['element'], element2: T['element']): Promise<boolean>
  extractHostName?(driver: T['driver']): string | null
  // #endregion

  // #region COMMANDS
  mainContext(context: T['context']): Promise<T['context']>
  parentContext?(context: T['context']): Promise<T['context']>
  childContext(context: T['context'], element: T['element']): Promise<T['context']>
  executeScript(context: T['context'], script: ((arg?: any) => any) | string, arg?: any): Promise<any>
  findElement(context: T['context'], selector: T['selector'], parent?: T['element']): Promise<T['element'] | null>
  findElements(context: T['context'], selector: T['selector'], parent?: T['element']): Promise<T['element'][]>
  waitForSelector?(
    context: T['context'],
    selector: T['selector'],
    parent?: T['element'],
    options?: WaitOptions,
  ): Promise<T['element'] | null>
  setElementText?(context: T['context'], element: T['element'], text: string): Promise<void>
  getElementText?(context: T['context'], element: T['element']): Promise<string>
  setWindowSize?(driver: T['driver'], size: Size): Promise<void>
  getWindowSize?(driver: T['driver']): Promise<Size>
  setViewportSize?(driver: T['driver'], size: Size): Promise<void>
  getViewportSize?(driver: T['driver']): Promise<Size>
  getCookies?(driver: T['driver'] | T['context'], context?: boolean): Promise<Cookie[]>
  getDriverInfo?(driver: T['driver']): Promise<DriverInfo>
  getCapabilities?(driver: T['driver']): Promise<Record<string, any>>
  getTitle(driver: T['driver']): Promise<string>
  getUrl(driver: T['driver']): Promise<string>
  takeScreenshot(driver: T['driver']): Promise<Buffer | string>
  click?(context: T['context'], element: T['element'] | T['selector']): Promise<void>
  visit?(driver: T['driver'], url: string): Promise<void>
  // #endregion

  // #region MOBILE COMMANDS
  getOrientation?(driver: T['driver']): Promise<ScreenOrientation>
  setOrientation?(driver: T['driver'], orientation: ScreenOrientation): Promise<void>
  getSystemBars?(driver: T['driver']): Promise<{
    statusBar: {visible: boolean; x: number; y: number; height: number; width: number}
    navigationBar: {visible: boolean; x: number; y: number; height: number; width: number}
  }>
  getElementRegion?(driver: T['driver'], element: T['element']): Promise<Region>
  getElementAttribute?(driver: T['driver'], element: T['element'], attr: string): Promise<string>
  performAction?(driver: T['driver'], steps: any[]): Promise<void>
  getCurrentWorld?(driver: T['driver']): Promise<string>
  getWorlds?(driver: T['driver']): Promise<string[]>
  switchWorld?(driver: T['driver'], id: string): Promise<void>
  // #endregion

  getSessionMetadata?(driver: T['driver']): Promise<any>
}

export type DriverInfo = {
  sessionId?: string
  remoteHostname?: string
  browserName?: string
  browserVersion?: string
  platformName?: string
  platformVersion?: string
  deviceName?: string
  userAgent?: string
  viewportLocation?: Location
  viewportSize?: Size
  displaySize?: Size
  orientation?: ScreenOrientation
  pixelRatio?: number
  viewportScale?: number
  safeArea?: Region
  statusBarSize?: number
  navigationBarSize?: number
  isW3C?: boolean
  isChrome?: boolean
  isChromium?: boolean
  isEmulation?: boolean
  isMobile?: boolean
  isNative?: boolean
  isAndroid?: boolean
  isIOS?: boolean
  isMac?: boolean
  isWindows?: boolean
  isWebView?: boolean
  isECClient?: boolean
  features?: {
    shadowSelector?: boolean
    allCookies?: boolean
    canExecuteOnlyFunctionScripts?: boolean
  }
}

export type WaitOptions = {
  state?: 'exist' | 'visible'
  interval?: number
  timeout?: number
}
