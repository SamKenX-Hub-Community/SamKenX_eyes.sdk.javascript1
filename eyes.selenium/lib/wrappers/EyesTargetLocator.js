'use strict';

const { Command, Name } = require('selenium-webdriver/lib/command');
const { TargetLocator } = require('selenium-webdriver/lib/webdriver');
const { Location, RectangleSize, ArgumentGuard, GeneralUtils } = require('@applitools/eyes.sdk.core');

const { Frame } = require('../frames/Frame');
const { FrameChain } = require('../frames/FrameChain');
const { ScrollPositionProvider } = require('../positioning/ScrollPositionProvider');
const { SeleniumJavaScriptExecutor } = require('../SeleniumJavaScriptExecutor');
const { EyesWebElement } = require('./EyesWebElement');
const { EyesWebElementPromise } = require('./EyesWebElementPromise');

/**
 * Wraps a target locator so we can keep track of which frames have been switched to.
 */
class EyesTargetLocator extends TargetLocator {
  /**
   * Initialized a new EyesTargetLocator object.
   *
   * @param {Logger} logger A Logger instance.
   * @param {EyesWebDriver} driver The WebDriver from which the targetLocator was received.
   * @param {TargetLocator} targetLocator The actual TargetLocator object.
   */
  constructor(logger, driver, targetLocator) {
    ArgumentGuard.notNull(logger, 'logger');
    ArgumentGuard.notNull(driver, 'driver');
    ArgumentGuard.notNull(targetLocator, 'targetLocator');

    super(driver.getRemoteWebDriver());

    this._logger = logger;
    this._driver = driver;
    this._targetLocator = targetLocator;
    this._jsExecutor = new SeleniumJavaScriptExecutor(driver);
    this._scrollPosition = new ScrollPositionProvider(this._logger, this._jsExecutor);
    this._defaultContentPositionMemento = null;

    // TODO: remove once selenium SDK 4 is fixed
    // the command is not exists in selenium js sdk, we should define it manually
    this._driver.getExecutor().defineCommand(Name.SWITCH_TO_FRAME_PARENT, 'POST', '/session/:sessionId/frame/parent');
  }

  // noinspection JSCheckFunctionSignatures
  /**
   * Schedules a command to switch the focus of all future commands to another frame on the page. The target frame may
   * be specified as one of the following:
   *
   * - A number that specifies a (zero-based) index into [window.frames](
   *   https://developer.mozilla.org/en-US/docs/Web/API/Window.frames).
   * - A string, which correspond to a `id` or `name` of element.
   * - A {@link WebElement} reference, which correspond to a `frame` or `iframe` DOM element.
   * - The `null` value, to select the topmost frame on the page. Passing `null`
   *   is the same as calling {@link #defaultContent defaultContent()}.
   *
   * @override
   * @param {number|string|WebElement|null} arg1 The frame locator.
   * @return {Promise<void>} A promise that will be resolved when the driver has changed focus to the specified frame.
   */
  async frame(arg1) {
    if (!arg1) {
      this._logger.verbose('EyesTargetLocator.frame(null)');
      await this.defaultContent();
      return;
    }

    if (Number.isInteger(arg1)) {
      const frameIndex = arg1;
      this._logger.verbose(`EyesTargetLocator.frame(${frameIndex})`);
      // Finding the target element so and reporting it using onWillSwitch.
      this._logger.verbose('Getting frames list...');
      const frames = await this._driver.findElementsByCssSelector('frame, iframe');
      if (frameIndex > frames.length) {
        throw new TypeError(`Frame index [${frameIndex}] is invalid!`);
      }

      this._logger.verbose('Done! getting the specific frame...');
      this._logger.verbose('Done! Making preparations...');
      await this.willSwitchToFrame(frames[frameIndex]);

      this._logger.verbose('Done! Switching to frame...');
      await this._targetLocator.frame(frameIndex);
      this._logger.verbose('Done!');
      return;
    }

    if (GeneralUtils.isString(arg1)) {
      const frameNameOrId = arg1;
      this._logger.verbose(`EyesTargetLocator.frame(${frameNameOrId})`);
      // Finding the target element so we can report it.
      // We use find elements(plural) to avoid exception when the element is not found.
      this._logger.verbose('Getting frames by name...');
      let frames = await this._driver.findElementsByName(frameNameOrId);
      if (frames.length === 0) {
        this._logger.verbose('No frames Found! Trying by id...');
        // If there are no frames by this name, we'll try the id
        frames = await this._driver.findElementsById(frameNameOrId);
        if (frames.length === 0) {
          // No such frame, bummer
          throw new TypeError(`No frame with name or id '${frameNameOrId}' exists!`);
        }
      }

      this._logger.verbose('Done! Making preparations...');
      await this.willSwitchToFrame(frames[0]);

      this._logger.verbose('Done! Switching to frame...');
      let frameElement = frames[0];
      if (frameElement instanceof EyesWebElement) {
        frameElement = frameElement.getWebElement();
      }
      await this._targetLocator.frame(frameElement);

      this._logger.verbose('Done!');
      return;
    }

    let frameElement = arg1;
    this._logger.verbose('EyesTargetLocator.frame(element)');
    this._logger.verbose('Making preparations...');
    await this.willSwitchToFrame(frameElement);

    this._logger.verbose('Done! Switching to frame...');
    if (frameElement instanceof EyesWebElement) {
      frameElement = frameElement.getWebElement();
    }
    await this._targetLocator.frame(frameElement);

    this._logger.verbose('Done!');
  }

  /** @inheritDoc */
  async parentFrame() {
    this._logger.verbose('EyesTargetLocator.parentFrame()');
    if (this._driver.getFrameChain().size() !== 0) {
      this._logger.verbose('Making preparations...');
      this._driver.getFrameChain().pop();
      this._logger.verbose('Done! Switching to parent frame..');
      await EyesTargetLocator.tryParentFrame(this._targetLocator, this._driver.getFrameChain());
      this._logger.verbose('Done!');
    }
  }

  /**
   * @param {TargetLocator} targetLocator
   * @param {FrameChain} frameChainToParent
   * @return {Promise<void>}
   */
  static async tryParentFrame(targetLocator, frameChainToParent) {
    try {
      await targetLocator.parentFrame();
    } catch (ignored) {
      await targetLocator.defaultContent();
      for (const frame of frameChainToParent) {
        await targetLocator.frame(frame.getReference());
      }
    }
  }

  /**
   * Switches into every frame in the frame chain. This is used as way to switch into nested frames (while considering
   * scroll) in a single call.
   *
   * @param {FrameChain} frameChain The path to the frame to switch to.
   * @return {Promise<void>} A promise that will be resolved when the command has completed.
   */
  async framesDoScroll(frameChain) {
    this._logger.verbose('EyesTargetLocator.framesDoScroll(frameChain)');
    await this._driver.switchTo().defaultContent();
    this._defaultContentPositionMemento = await this._scrollPosition.getState();

    for (const frame of frameChain.getFrames()) {
      this._logger.verbose('Scrolling by parent scroll position...');
      const frameLocation = frame.getLocation();
      await this._scrollPosition.setPosition(frameLocation);
      this._logger.verbose('Done! Switching to frame...');
      await this._driver.switchTo().frame(frame.getReference());
      this._logger.verbose('Done!');
    }

    this._logger.verbose('Done switching into nested frames!');
  }

  /**
   * Switches into every frame in the frame chain. This is used as way to switch into nested frames (while considering
   * scroll) in a single call.
   *
   * @param {FrameChain|string[]} obj The path to the frame to switch to. Or the path to the frame to check. This is a
   *   list of frame names/IDs (where each frame is nested in the previous frame).
   * @return {Promise<void>} The WebDriver with the switched context.
   */
  async frames(obj) {
    if (obj instanceof FrameChain) {
      const frameChain = obj;
      this._logger.verbose('EyesTargetLocator.frames(frameChain)');
      await this._driver.switchTo().defaultContent();

      for (const frame of frameChain.getFrames()) {
        this._logger.verbose('Switching to frame...');
        await this._driver.switchTo().frame(frame.getReference());
        this._logger.verbose('Done!');
      }

      this._logger.verbose('Done switching into nested frames!');
      return;
    }

    if (Array.isArray(obj)) {
      this._logger.verbose('EyesTargetLocator.frames(framesPath)');

      for (const frameNameOrId of obj) {
        this._logger.verbose('Switching to frame...');
        await this._driver.switchTo().frame(frameNameOrId);
        this._logger.verbose('Done!');
      }

      this._logger.verbose('Done switching into nested frames!');
    }
  }

  // noinspection JSCheckFunctionSignatures
  /** @inheritDoc */
  async window(nameOrHandle) {
    this._logger.verbose('EyesTargetLocator.window()');
    this._driver.getFrameChain().clear();
    this._logger.verbose('Done! Switching to window...');
    await this._targetLocator.window(nameOrHandle);
    this._logger.verbose('Done!');
  }

  /** @inheritDoc */
  async defaultContent() {
    this._logger.verbose('EyesTargetLocator.defaultContent()');
    if (this._driver.getFrameChain().size() !== 0) {
      this._logger.verbose('Making preparations...');
      this._driver.getFrameChain().clear();
      this._logger.verbose('Done! Switching to default content...');
      await this._targetLocator.defaultContent();
      this._logger.verbose('Done!');
    }
  }

  // noinspection JSCheckFunctionSignatures
  /**
   * Schedules a command retrieve the {@code document.activeElement} element on the current document, or
   * {@code document.body} if activeElement is not available.
   *
   * @override
   * @return {!EyesWebElementPromise}
   */
  activeElement() {
    this._logger.verbose('EyesTargetLocator.activeElement()');
    this._logger.verbose('Switching to element...');
    // noinspection JSCheckFunctionSignatures
    const id = this._driver.execute(new Command(Name.GET_ACTIVE_ELEMENT));

    this._logger.verbose('Done!');
    return new EyesWebElementPromise(this._logger, this._driver, id);
  }

  /**
   * Schedules a command to change focus to the active modal dialog, such as those opened by `window.alert()`,
   * `window.confirm()`, and `window.prompt()`. The returned promise will be rejected with a
   * {@linkplain error.NoSuchAlertError} if there are no open alerts.
   *
   * @return {!AlertPromise} The open alert.
   */
  alert() {
    this._logger.verbose('EyesTargetLocator.alert()');
    this._logger.verbose('Switching to alert...');
    const result = this._targetLocator.alert();
    this._logger.verbose('Done!');
    return result;
  }

  /**
   * @return {Promise<void>}
   */
  async resetScroll() {
    if (this._defaultContentPositionMemento != null) {
      await this._scrollPosition.restoreState(this._defaultContentPositionMemento);
    }
  }

  /**
   * Will be called before switching into a frame.
   *
   * @param {WebElement} targetFrame The element about to be switched to.
   * @return {Promise<void>}
   */
  async willSwitchToFrame(targetFrame) {
    ArgumentGuard.notNull(targetFrame, 'targetFrame');

    this._logger.verbose('willSwitchToFrame()');
    this._logger.verbose('Frame');

    const eyesFrame = (targetFrame instanceof EyesWebElement) ?
      targetFrame : new EyesWebElement(this._logger, this._driver, targetFrame);

    const rect = await eyesFrame.getRect();
    const location = new Location(rect);
    const elementSize = new RectangleSize(rect);

    const clientWidth = await eyesFrame.getClientWidth();
    const clientHeight = await eyesFrame.getClientHeight();
    const clientSize = new RectangleSize(clientWidth, clientHeight);

    const borderLeftWidth = await eyesFrame.getComputedStyleInteger('border-left-width');
    const borderTopWidth = await eyesFrame.getComputedStyleInteger('border-top-width');
    const contentLocation = new Location(location.getX() + borderLeftWidth, location.getY() + borderTopWidth);

    const originalLocation = await this._scrollPosition.getCurrentPosition();
    const originalOverflow = await eyesFrame.getOverflow();

    const frame = new Frame(this._logger, targetFrame, contentLocation, elementSize, clientSize, originalLocation, originalOverflow);
    this._driver.getFrameChain().push(frame);
  }
}

exports.EyesTargetLocator = EyesTargetLocator;
