// @ts-nocheck

const {inspect} = require('util')
const utils = require('@applitools/utils')
const snippets = require('@applitools/snippets')

const WELL_KNOWN_SCRIPTS = {
  'dom-snapshot': script => /\/\* @applitools\/dom-snapshot@[\d.]+ \*\//.test(script),
  'dom-capture': script => /\/\* @applitools\/dom-capture@[\d.]+ \*\//.test(script),
}

const DEFAULT_DESKTOP_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36'
const DEFAULT_MOBILE_UA =
  'Mozilla/5.0 (Linux; Android 8.0.0; Pixel 2 XL Build/OPD1.170816.004) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Mobile Safari/537.36'

const DEFAULT_STYLES = {
  'border-left-width': '0px',
  'border-top-width': '0px',
  overflow: null,
}

const DEFAULT_PROPS = {
  clientWidth: 300,
  clientHeight: 400,
  overflow: null,
}
export class MockDriver {
  constructor(options = {}) {
    const {viewport = {width: 1000, height: 1000}, device, platform, browser, ua} = options
    this._device = device
    this._platform = platform
    this._browser = browser
    this._ua = ua
    this._window = {
      title: 'Default Page Title',
      url: 'http://default.url',
      rect: {x: 0, y: 0, ...viewport},
    }
    this._methods = new Map()
    this._scripts = new Map()
    this._elements = new Map()
    this._contexts = new Map()
    this._contexts.set(null, {
      document: {id: Symbol('documentId')},
      state: {
        get name() {
          return null
        },
      },
    })
    this._contextId = null
    this.mockElement('html', {scrollPosition: {x: 0, y: 0}})
    this.mockScript(snippets.getContextInfo, async () => {
      const context = this._contexts.get(this._contextId)
      const isRoot = !this._contextId
      const isCORS = !isRoot && context.isCORS
      const contentDocument = await this.findElement('html')
      const selector = !isCORS && !isRoot ? context.element.selector : null
      return [contentDocument, selector, isRoot, isCORS]
    })
    this.mockScript(snippets.isEqualElements, async ([element1, element2]) => {
      return element1.id === element2.id
    })
    this.mockScript(snippets.getDocumentScrollingElement, async () => {
      return 'html'
    })
    this.mockScript(snippets.getChildFramesInfo, () => {
      return Array.from(this._contexts.values())
        .filter(frame => frame.parentId === this._contextId)
        .map(frame => [frame.element, frame.isCORS])
    })
    this.mockScript(snippets.getElementRect, ([element]) => {
      return element.rect || {x: 0, y: 0, width: 100, height: 100}
    })
    this.mockScript(snippets.getElementComputedStyleProperties, ([element, properties]) => {
      return properties.map(property => (element.styles || {})[property] || DEFAULT_STYLES[property])
    })
    this.mockScript(snippets.getElementProperties, ([element, properties]) => {
      return properties.map(property => (element.props || {})[property] || DEFAULT_PROPS[property])
    })
    this.mockScript(snippets.setElementStyleProperties, ([element, properties]) => {
      return Object.entries(properties).reduce((original, [name, value]) => {
        original[name] = {value: element.style[name], important: false}
        element.style[name] = value
        return original
      }, {})
    })
    this.mockScript(snippets.setElementAttributes, ([element, attributes]) => {
      return Object.entries(attributes).reduce((original, [name, value]) => {
        original[name] = element.attrs[name]
        element.attrs[name] = value
        return original
      }, {})
    })
    this.mockScript(snippets.scrollTo, ([element, offset]) => {
      let scrollingElement = element
      if (!element) {
        scrollingElement = this.findElement('html')
      }
      scrollingElement.scrollPosition = offset
      return [scrollingElement.scrollPosition.x, scrollingElement.scrollPosition.y]
    })
    this.mockScript(snippets.getElementScrollOffset, ([element]) => {
      let scrollingElement = element
      if (!element) {
        scrollingElement = this.findElement('html')
      }
      if (!scrollingElement.scrollPosition) {
        scrollingElement.scrollPosition = {x: 0, y: 0}
      }
      return {x: scrollingElement.scrollPosition.x, y: scrollingElement.scrollPosition.y}
    })
    this.mockScript(snippets.getElementInnerOffset, ([element]) => {
      let scrollingElement = element
      if (!element) {
        scrollingElement = this.findElement('html')
      }
      if (!scrollingElement.scrollPosition) {
        scrollingElement.scrollPosition = {x: 0, y: 0}
      }
      return {x: scrollingElement.scrollPosition.x, y: scrollingElement.scrollPosition.y}
    })
    this.mockScript(snippets.getShadowRoot, ([element]) => {
      return element
    })
    this.mockScript(snippets.getBrowserInfo, () => {
      return JSON.stringify({
        status: 'SUCCESS',
        value: {
          userAgent: this._ua !== undefined ? this._ua : this.info.isMobile ? DEFAULT_MOBILE_UA : DEFAULT_DESKTOP_UA,
          pixelRatio: 1,
        },
      })
    })
    this.mockScript(snippets.getViewportSize, () => {
      return {width: this._window.rect.width, height: this._window.rect.height}
    })
    this.mockScript(snippets.getElementXpath, ([element]) => {
      if (element.xpath) return element.xpath
      const elements = Array.from(this._elements.values()).reduce((elements, array) => elements.concat(array), [])
      const index = elements.findIndex(({id}) => id === element.id)
      return index >= 0 ? `/HTML[1]/BODY[1]/DIV[${index + 1}]` : `//[data-fake-selector="${element.selector}"]`
    })
    this.mockScript(snippets.blurElement, () => {
      return null
    })
    this.mockScript(snippets.addElementIds, ([elements, ids]) => {
      const selectors = []
      for (const [index, element] of elements.entries()) {
        const elementId = ids[index]
        element.attributes = element.attributes || []
        element.attributes.push({name: 'data-applitools-selector', value: elementId})
        const selector = `[data-applitools-selector~="${elementId}"]`
        selectors.push([selector])
      }
      return selectors
    })
    this.mockScript(snippets.cleanupElementIds, ([elements]) => {
      for (const el of elements) {
        el.attributes.splice(
          el.attributes.findIndex(({name}) => name === 'data-applitools-marker'),
          1,
        )
      }
    })
    this.mockScript(snippets.getElementContentSize, ([element]) => {
      return element.rect || {x: 0, y: 0, width: 100, height: 100}
    })
    this.mockScript(snippets.getDocumentSize, () => {
      // TODO get window for context: `this.contexts.get(this._contextId)`
      return {width: this._window.rect.width, height: this._window.rect.height}
    })
  }
  mockScript(scriptMatcher, resultGenerator) {
    this._scripts.set(String(scriptMatcher), resultGenerator)
  }
  mockElement(selector, state) {
    const element = {
      id: Symbol('elementId' + Math.floor(Math.random() * 100)),
      attrs: {},
      style: {},
      selector,
      parentId: null,
      parentContextId: null,
      parentRootId: null,
      ...state,
    }
    if (element.shadow) {
      element.shadowRootId = Symbol('shadowId' + (element.name || Math.floor(Math.random() * 100)))
    }
    if (element.frame) {
      const contextId = Symbol('contextId' + (element.name || Math.floor(Math.random() * 100)))
      this._contexts.set(contextId, {
        id: contextId,
        parentId: state.parentContextId,
        isCORS: state.isCORS,
        element,
        document: {id: Symbol('documentId' + (element.name || Math.floor(Math.random() * 100)))},
        state: {
          get name() {
            return element.name || element.selector
          },
        },
      })
      element.contextId = contextId
      this.mockElement('html', {
        parentContextId: contextId,
        scrollPosition: {x: 0, y: 0},
      })
    }
    this.mockSelector(selector, element)
    return element
  }
  unmockElement(element) {
    this.unmockSelector(element.selector, element)
  }
  mockElements(nodes, {parentId = null, parentContextId = null, parentRootId = null} = {}) {
    for (const node of nodes) {
      const element = this.mockElement(node.selector, {...node, parentId, parentContextId, parentRootId})
      if (node.children) {
        this.mockElements(node.children, {
          parentId: element.frame ? null : element.id,
          parentContextId: element.frame ? element.contextId : parentContextId,
          parentRootId: element.shadow ? element.shadowRootId : parentRootId,
        })
      }
    }
  }
  mockSelector(selector, element) {
    let elements = this._elements.get(selector)
    if (!elements) {
      elements = []
      this._elements.set(selector, elements)
    }
    elements.push(element)
  }
  unmockSelector(selector, element) {
    const elements = this._elements.get(selector)
    if (!elements) return
    const index = elements.indexOf(element)
    if (index < 0) return
    elements.splice(index, 1)
  }
  wrapMethod<
    TName extends {
      [K in keyof MockDriver]: MockDriver[K] extends (...args: any[]) => any ? K : never
    }[keyof MockDriver],
  >(
    name: TName,
    wrapper: (method: this[TName], thisArg: this, args: Parameters<this[TName]>) => ReturnType<this[TName]>,
  ) {
    if (!this[name] || name.startsWith('_') || !utils.types.isFunction(this[name])) return
    if (this._methods.has(name)) this.unwrapMethod(name)
    this._methods.set(name, this[name])
    this[name] = new Proxy(this[name], {
      apply: (method, driver, args) => wrapper(method, driver, args),
    })
  }
  unwrapMethod(name) {
    const method = this._methods.get(name)
    if (!method) return
    this[name] = method
  }

  get info() {
    return {
      isMobile: this._device ? Boolean(this._device.isMobile) : false,
      isNative: this._device ? Boolean(this._device.isNative) : false,
      deviceName: this._device ? this._device.name : null,
      platformName: this._platform ? this._platform.name : null,
      platformVersion: this._platform ? this._platform.version : null,
      browserName: this._browser ? this._browser.name : null,
      browserVersion: this._browser ? this._browser.version : null,
    }
  }
  async executeScript(script, args = []) {
    if (this.info.isNative) throw new Error("Native context doesn't support this method")
    let result = this._scripts.get(String(script))
    if (!result) {
      const name = Object.keys(WELL_KNOWN_SCRIPTS).find(name => WELL_KNOWN_SCRIPTS[name](script))
      if (!name) return null
      result = this._scripts.get(name)
    }
    const {state} = this._contexts.get(this._contextId)
    return utils.types.isFunction(result) ? result.call(state, ...args) : result
  }
  async findElement(selector, rootElement?: any) {
    const elements = this._elements.get(selector)
    return elements
      ? elements.find(
          element =>
            element.parentContextId === this._contextId &&
            element.parentRootId === ((rootElement || {}).shadowRootId || null),
        )
      : null
  }
  async findElements(selector, rootElement?: any) {
    const elements = this._elements.get(typeof selector === 'string' ? selector : selector.id)
    return elements
      ? elements.filter(
          element =>
            element.parentContextId === this._contextId &&
            element.parentRootId === ((rootElement || {}).shadowRootId || null),
        )
      : []
  }
  async switchToFrame(reference) {
    if (reference === null) {
      this._contextId = null
      return this
    }
    if (utils.types.isString(reference)) {
      reference = await this.findElement(reference)
    }

    const frame = this._contexts.get(reference.contextId)
    if (frame && this._contextId === frame.parentId) {
      this._contextId = frame.id
      return this
    } else {
      throw new Error('Frame not found')
    }
  }
  async switchToParentFrame() {
    if (!this._contextId) return this
    for (const frame of this._contexts.values()) {
      if (frame.id === this._contextId) {
        this._contextId = frame.parentId
        return this
      }
    }
    return this
  }
  async getWindowRect() {
    return this._window.rect
  }
  async setWindowRect(rect) {
    Object.assign(this._window.rect, rect)
  }
  async getUrl() {
    if (this.info.isNative) throw new Error("Native context doesn't support this method")
    return this._window.url
  }
  async getTitle() {
    if (this.info.isNative) throw new Error("Native context doesn't support this method")
    return this._window.title
  }
  async visit(url) {
    if (this.info.isNative) throw new Error("Native context doesn't support this method")
    this._window.url = url
  }
  async takeScreenshot(): Promise<unknown> {
    // const image = new png.Image({
    //   width: this._window.rect.width,
    //   height: this._window.rect.height,
    // })
    // const stream = image.pack()
    // return new Promise((resolve, reject) => {
    //   let buffer = Buffer.from([])
    //   stream.on('data', chunk => {
    //     buffer = Buffer.concat([buffer, chunk])
    //   })
    //   stream.on('end', () => resolve(buffer))
    //   stream.on('error', reject)
    // })
  }
  toString() {
    return '<MockDriver>'
  }
  toJSON() {
    return '<MockDriver>'
  }
  [inspect.custom]() {
    return '<MockDriver>'
  }
}
