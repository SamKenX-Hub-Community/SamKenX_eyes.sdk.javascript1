import type {Size, Location, Region} from '@applitools/utils'

export type Selector = string | {selector: string; type?: string; shadow?: Selector; frame?: Selector}

export type ScreenshotSettings = {
  region?: Region | Selector
  debugImages?: {path: string; prefix?: string}
  fully?: boolean
  scrollRootElement?: Selector
  hideScrollbars?: boolean
  hideCaret?: boolean
  overlap?: {
    top?: number
    bottom?: number
  }
  waitBeforeCapture?: number
  waitBetweenStitches?: number
  lazyLoad?:
    | boolean
    | {
        scrollLength?: number
        waitingTime?: number
        maxAmountToScroll?: number
      }
  webview?: boolean | string
  name?: string
  selectorsToFindRegionsFor?: Selector[]
}

export type Screenshot = {
  image: Buffer | string
  size?: Size
  name?: string
  source?: string
  dom?: string
  locationInViewport?: Location
  locationInView?: Location
  fullViewSize?: Size
}

export type SnapshotSettings = {
  name?: string
  renderers: any[]
  resourceSeparation?: boolean
  waitBeforeCapture?: number
}

export type AndroidSnapshot = {
  platformName: 'android'
  vhsType: string
  vhsHash: {hashFormat: string; hash: string; contentType: string}
}
export type IOSSnapshot = {
  platformName: 'ios'
  vhsCompatibilityParams: Record<string, any>
} & (
  | {resourceContents: Record<string, {type: string; value: Buffer}>}
  | {vhsHash: {hashFormat: string; hash: string; contentType: string}}
)
