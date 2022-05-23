const utils = require('@applitools/utils')
const makeScroller = require('./scroller')

async function getTarget({window, context, region, fully, scrollingMode, logger}) {
  if (window) {
    // window/app
    logger.log('Window screenshot target detected')
    const scrollingElement = await context.main.getScrollingElement()
    return {
      context: context.main,
      scroller: makeScroller({element: scrollingElement, scrollingMode, logger}),
    }
  } else if (region) {
    if (utils.types.has(region, ['x', 'y', 'width', 'height'])) {
      // region by coordinates
      logger.log('Region screenshot target detected with static region:', region)
      const scrollingElement = await context.getScrollingElement()
      return {
        context,
        region,
        scroller: makeScroller({element: scrollingElement, scrollingMode, logger}),
      }
    } else {
      // region by element or selector
      logger.log('Region screenshot target detected with element:', region)
      const element = await context.element(region)
      if (!element) throw new Error('Element not found!')

      const elementContext = element.context

      if (element.driver.isNative) {
        // if element is in a native context, then scroll it to the top, otherwise, it will be not possible to get all of its size
        const scrollingElement = await elementContext.getScrollingElement()
        if (scrollingElement && (await scrollingElement.contains(element))) {
          await scrollingElement.scrollTo(await element.getRegion())
        }
      }

      if (fully) {
        const isScrollable = await element.isScrollable()
        // if element is scrollable, then take screenshot of the full element content, otherwise take screenshot of full element
        const region = isScrollable ? null : await element.getRegion()
        const scrollingElement = isScrollable ? element : await elementContext.getScrollingElement()
        // css stitching could be applied only to root element of its context
        scrollingMode = scrollingMode === 'css' && !(await scrollingElement.isRoot()) ? 'mixed+' : scrollingMode
        return {
          context: elementContext,
          region,
          scroller: makeScroller({element: scrollingElement, scrollingMode, logger}),
        }
      } else {
        const scrollingElement = await context.getScrollingElement()
        return {
          context: elementContext,
          region: await element.getRegion(),
          scroller: makeScroller({element: scrollingElement, scrollingMode, logger}),
        }
      }
    }
  } else if (!context.isMain) {
    // context
    logger.log('Context screenshot target detected')
    if (fully) {
      const scrollingElement = await context.getScrollingElement()
      return {
        context,
        scroller: makeScroller({element: scrollingElement, scrollingMode, logger}),
      }
    } else {
      const scrollingElement = await context.parent.getScrollingElement()
      const element = await context.getContextElement()
      return {
        context: context.parent,
        region: await element.getRegion(), // IMHO we should use CLIENT (without borders) region here
        scroller: makeScroller({element: scrollingElement, scrollingMode, logger}),
      }
    }
  }
}

module.exports = getTarget
