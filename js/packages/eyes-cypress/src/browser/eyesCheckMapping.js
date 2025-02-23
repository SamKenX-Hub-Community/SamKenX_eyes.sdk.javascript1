/* global Node */
function eyesCheckMapValues({args, refer}) {
  if (typeof args === `string`) {
    args = {tag: args}
  }
  const config = args // just did it for having less git changes at this moment
  const mappedValues = [
    'tag',
    'scriptHooks',
    'ignore',
    'floating',
    'strict',
    'layout',
    'content',
    'accessibility',
    'region',
    'selector',
    'element',
  ]

  let regionSettings = {}
  let shadowDomSettings = {}
  const checkSettings = {
    name: config.tag,
    hooks: config.scriptHooks,
    ignoreRegions: convertPaddedRegion(config.ignore),
    floatingRegions: convertFloatingRegion(config.floating),
    strictRegions: convertPaddedRegion(config.strict),
    layoutRegions: convertPaddedRegion(config.layout),
    contentRegions: convertPaddedRegion(config.content),
    accessibilityRegions: convertAccessabilityRegions(config.accessibility),
  }

  if (config.target === 'region') {
    if (!Array.isArray(config.selector)) {
      if (config.element) {
        if (isHTMLElement(config.element)) {
          regionSettings = {
            region: Object.assign(refer.ref(config.element), {type: 'element'}),
          }
        } else {
          // JQuery element
          regionSettings = {
            region: Object.assign(refer.ref(config.element[0]), {type: 'element'}),
          }
        }
      } else if (
        config.region &&
        config.region.hasOwnProperty('top') &&
        config.region.hasOwnProperty('left') &&
        config.region.hasOwnProperty('width') &&
        config.region.hasOwnProperty('height')
      ) {
        regionSettings = {
          region: {
            y: config.region.top,
            x: config.region.left,
            width: config.region.width,
            height: config.region.height,
          },
        }
      } else if (!config.hasOwnProperty('selector')) {
        regionSettings = {
          region: config.region,
        }
      } else {
        regionSettings = {
          region: config.selector,
        }
      }
    } else {
      const selectors = config.selector
      for (let i = selectors.length - 1; i > -1; i--) {
        if (i === selectors.length - 1) {
          shadowDomSettings['shadow'] = selectors[i].selector
        } else {
          const prevSettings = Object.assign({}, shadowDomSettings)
          shadowDomSettings['selector'] = selectors[i].selector
          if (!prevSettings.hasOwnProperty('selector')) {
            shadowDomSettings['shadow'] = prevSettings.shadow
          } else {
            shadowDomSettings['shadow'] = prevSettings
          }
        }
      }
      regionSettings = {region: shadowDomSettings}
    }
  }

  for (const val of mappedValues) {
    if (config.hasOwnProperty(val)) {
      delete config[val]
    }
  }

  return Object.assign({}, checkSettings, regionSettings, config)

  // #region helper functions

  function convertPaddedRegion(regions) {
    if (!regions) return
    if (!Array.isArray(regions)) regions = [regions]
    let resRegions = []
    for (const region of regions) {
      if (region.element || isHTMLElement(region) || region.jquery) {
        if (region.padding || region.regionId) {
          let currRefElements = refElements(region.element)
          for (const refElement of currRefElements) {
            let curr = {region: refElement}
            if (region.padding) {
              curr.padding = region.padding
            }
            if (region.regionId) {
              curr.regionId = region.regionId
            }
            resRegions.push(curr)
          }
        } else {
          resRegions = [...resRegions, ...refElements(region)]
        }
      } else {
        if (region.selector && !region.type) {
          region.region = region.selector
          delete region.selector
        }
        resRegions.push(region)
      }
    }
    return resRegions
  }

  function convertAccessabilityRegions(accessibilityRegions) {
    if (!accessibilityRegions) return accessibilityRegions
    if (!Array.isArray(accessibilityRegions)) {
      accessibilityRegions = [accessibilityRegions]
    }
    const accessibility = []

    accessibilityRegions.map(region => {
      const accessabilityRegion = {
        type: region.accessibilityType,
      }
      if (region.hasOwnProperty('selector')) {
        accessabilityRegion.region = region.selector
        accessibility.push(accessabilityRegion)
      } else if (region.hasOwnProperty('element')) {
        const elements = refElements(region.element)
        delete region['element']
        for (const element of elements) {
          accessibility.push(Object.assign({}, region, accessabilityRegion, {region: element}))
        }
      } else if (region.hasOwnProperty('region')) {
        region.type = region.region.accessibilityType
        delete region.region.accessibilityType
        accessibility.push(region)
      } else {
        accessabilityRegion.region = {
          y: region.top,
          x: region.left,
          width: region.width,
          height: region.height,
        }
        accessibility.push(accessabilityRegion)
      }
    })

    return accessibility
  }

  function convertFloatingRegion(floatingRegions) {
    if (!floatingRegions) return floatingRegions
    if (!Array.isArray(floatingRegions)) {
      floatingRegions = [floatingRegions]
    }
    const floating = []

    for (const region of floatingRegions) {
      const floatingRegion = {
        maxDownOffset: region.maxDownOffset || 0,
        maxLeftOffset: region.maxLeftOffset || 0,
        maxUpOffset: region.maxUpOffset || 0,
        maxRightOffset: region.maxRightOffset || 0,
      }
      if (region.hasOwnProperty('selector')) {
        floatingRegion.region = region.selector
        floating.push(floatingRegion)
      } else if (region.hasOwnProperty('element')) {
        const elements = refElements(region.element)
        delete region['element']
        for (const element of elements) {
          floating.push(Object.assign({}, region, floatingRegion, {region: element}))
        }
      } else if (region.hasOwnProperty('region')) {
        floating.push(region)
      } else {
        floatingRegion.region = {
          y: region.top,
          x: region.left,
          width: region.width,
          height: region.height,
        }
        floating.push(floatingRegion)
      }
    }
    return floating
  }

  function refElements(regions) {
    if (!regions) return regions
    if (!Array.isArray(regions)) regions = [regions]
    const elements = []
    for (const region of regions) {
      if (isHTMLElement(region)) {
        elements.push(Object.assign(refer.ref(region), {type: 'element'}))
      } else if (region.jquery) {
        region.each(function () {
          // there's a small chance that `this` is not an HTML element. So we just verify it.
          elements.push(isHTMLElement(this) ? Object.assign(refer.ref(this), {type: 'element'}) : this)
        })
      } else {
        elements.push(region)
      }
    }
    return elements
  }

  // #endregion
}

function isHTMLElement(element) {
  // Avoiding instanceof here since the element might come from an iframe, and `instanceof HTMLElement` would fail.
  // This check looks naive, but if anyone passes something like {nodeType: 1} as a region, then I'm fine with them crashing :)
  return element.nodeType && element.nodeType === Node.ELEMENT_NODE
}

module.exports = {eyesCheckMapValues}
