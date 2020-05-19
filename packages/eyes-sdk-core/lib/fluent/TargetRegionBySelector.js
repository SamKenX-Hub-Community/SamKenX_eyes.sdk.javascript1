'use strict'

const {GetSelector} = require('./GetSelector')
const EyesUtils = require('../EyesUtils')

/**
 * @typedef {import('../wrappers/EyesWrappedElement').SupportedSelector} SupportedSelector
 * @typedef {import('../wrappers/EyesWrappedDriver')} EyesWrappedDriver
 *
 * @typedef {Object} PersistedRegions
 * @property {string} type - selector type (css or xpath)
 * @property {string} selector - selector itself
 */

/**
 * @ignore
 */
class TargetRegionBySelector extends GetSelector {
  /**
   * @param {SupportedSelector} selector
   */
  constructor(selector) {
    super()
    this._selector = selector
  }
  /**
   * @param {EyesWrappedDriver} driver
   * @return {Promise<PersistedRegions[]>}
   */
  async toPersistedRegions(driver) {
    driver.selector(this._selector)
    return EyesUtils.locatorToPersistedRegions(driver._logger, driver, this._selector)
  }
}

module.exports = TargetRegionBySelector
