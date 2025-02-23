# Change Log

## Unreleased










## 2.18.0 - 2022/12/27

### Features
- add support for "node14-linux-arm64"
### Bug fixes

## 2.17.4 - 2022/12/21

### Features
- Additional internal event logs
### Bug fixes
- Fixed issue when helper lib inputs were not cleaned up before calling new command
- Fixed issue with element scroll position not being restored after screenshot is taken on native platforms
- Handle fake shadowRoot with UFG
- Handed error during polling in long requests to eyes server

## 2.17.3 - 2022/11/29

### Features
### Bug fixes
- Fixed OCR functionality with latest Eyes server

## 2.17.2 - 2022/11/16

### Features
### Bug fixes
- Fixed issue when current context is not being preserved in ufg mode for webdriver frameworks

## 2.17.1 - 2022/11/16

### Features
- Use user agent metadata to improve browser environment detection logic
- Use APPLITOOLS_CONCURRENCY env variable to specify concurrency
### Bug fixes

## 2.17.0 - 2022/11/2

### Features
- Added new selector extensions `child` and `fallback`
### Bug fixes
- Fix bug that caused native apps to be classified as web when the app contains web views

## 2.16.9 - 2022/10/28

### Features
### Bug fixes
- Fix calculation for determining coded region positions when they are inside of a check region

## 2.16.8 - 2022/10/26

### Features
### Bug fixes
- Fixed error during command response logging

## 2.16.7 - 2022/10/22

### Features
- Added logs for command responses
### Bug fixes
- Fixed proxy issue with resource (screenshot/dom) uploading

## 2.16.6 - 2022/10/20

### Features
- Drop support for Android 9 and Android 10 specific devices
- Mark target element with `data-applitools-scroll` attribute before capture dom
### Bug fixes
- Fix dontCloseBatches mapping
- Fixed bug that caused `extractText` to throw, due to fractional size of the target region

## 2.16.5 - 2022/10/18

### Features
### Bug fixes
- Fixed default values for server url and api key while executing `Core.closeBatch` and `Core.deleteTest` commands

## 2.16.4 - 2022/10/13

### Features
- Changed default value of `sendDom` from `true` to dynamically calculated
- Increased time to spawn server process programmatically
### Bug fixes
- Fixed issue with ufg renders failing intermittently

## 2.16.3 - 2022/10/8

### Features
- Applied client's user-agent by default to resource requests in ufg mode
### Bug fixes
- Fixed node 12 support

## 2.16.2 - 2022/10/7

### Features
### Bug fixes
- Blank missed frames src in ufg
- Fix an issue when ufg related requests were not sent through the proxy

## 2.16.1 - 2022/10/4

### Features
### Bug fixes
- Fixed the issue with screenshots being taken on chrome-emulated devices

## 2.16.0 - 2022/9/29

### Features
- Deprecated "Content" match level value in favor of "IgnoreColors"
- Added support for webview switching in classic execution
### Bug fixes

## 2.15.0 - 2022/9/26

### Features
### Bug fixes
- Fixed issue with missed offsets when floating region was provided in legacy format
- Fixed issue with missed `userTestId` in manager's summary

## 2.14.0 - 2022/9/25

### Features
### Bug fixes
- Respond with dummy TestResult object on `Eyes.close` even if no session were actually started

## 2.13.5 - 2022/9/25

### Features
### Bug fixes
- Fixed the wrong naming of the error info field `testResults` renamed to `testResult`

## 2.13.4 - 2022/9/25

### Features
### Bug fixes
- Fixed propagation of the provided `userTestId` property
- Return error object in manager's summary in common format

## 2.13.3 - 2022/9/23

### Features
### Bug fixes
- Fixed `lazyLoad` property propagation to helper lib

## 2.13.2 - 2022/9/23

### Features
### Bug fixes
- Fixed `Eyes.check` command response regression

## 2.13.1 - 2022/9/23

### Features
### Bug fixes
- Fixed issue when lazy loading script being executed on native app

## 2.13.0 - 2022/9/23

### Features
- Added `--shutdown-mode` argument, which accepts `stdin` value to kill the process when its stdin stream ends. The default value is `lazy`, which preserves the current behavior
- Prevented any writes to stdout after port is reported
### Bug fixes
- Avoided unexpected touch actions during `check` on Android apps

## 2.12.3 - 2022/9/16

### Features
- Dummy changelog entry
### Bug fixes

## 2.12.2 - 2022/9/16

### Features
- Dummy changelog entry
### Bug fixes

## 2.12.1 - 2022/9/16

### Features
- Created testing client for eyes-universal
- Using `lazyLoad.waitingTime` as a delay between stitches by default
- Using proxy while polling for the result of the nml command
### Bug fixes

## 2.12.0 - 2022/9/15

### Features
- Add proxy support when using NML for NMG
### Bug fixes

## 2.11.3 - 2022/9/13

### Features
### Bug fixes
- Fixed issue that prevented NMG from working when NML was enabled

## 2.11.2 - 2022/9/12

### Features
### Bug fixes
- Sending correct commands with android helper lib

## 2.11.1 - 2022/9/7

### Features
- Dynamically include changelog entries in a release description and publish notifications to Slack
- Added support for lazy loading views in android native apps
- Add NML NMG support for iOS
### Bug fixes

## 2.11.0 - 2022/9/7

### Features
- Dynamically include changelog entries in a release description and publish notifications to Slack
- Added support for lazy loading views in android native apps
### Bug fixes

## 2.10.9 - 2022/9/5

### Features
- Add NML NMG support for iOS
### Bug fixes

## 2.10.8 - 2022/8/29

### Features
- disable the usage of `HelperAndroid` and `HelperIOS` once using `UFG`
### Bug fixes

## 2.10.7 - 2022/8/24

### Features
- Don't fail `eyes.open` when there is a failure to set viewport size in `UFG`.
### Bug fixes

## 2.10.6 - 2022/8/23

### Features
### Bug fixes
- Avoided implicit set of the `allowInvisibleElements` appium setting on Android

## 2.10.5 - 2022/8/12

### Features
- Added `--shutdown-mode` argument, which accepts `stdin` value to kill the process when its stdin stream ends. The default value is `lazy`, which preserves the current behavior
- Prevented any writes to stdout after port is reported
### Bug fixes
- Fixed error object serialization

## 2.10.4 - 2022/8/5

### Features
### Bug fixes
- Suppress error of log file creation when another process already created the same file

## 2.10.3 - 2022/8/1

### Features
### Bug fixes
- update vgc version

## 2.10.2 - 2022/7/28

### Features
- No changes
### Bug fixes

## 2.9.13 - 2022/7/27

### Features
### Bug fixes
- Fixed some issues with helper library usage

## 2.9.12 - 2022/7/21

### Features
### Bug fixes
- Make adjustments to support regionId in cypress SDK

## 2.9.11 - 2022/7/21

### Features
### Bug fixes
- Support adding `userTestId` to eyes.open config

## 2.9.10 - 2022/7/20

### Features
### Bug fixes
- Better support in DOM slot element

## 2.9.9 - 2022/7/18

### Features
### Bug fixes
- Avoided unexpected touch actions during `check` on Android apps

## 2.9.8 - 2022/7/18

### Features
### Bug fixes
- Support self-signed certificates when communicating with the driver

## 2.9.7 - 2022/7/15

### Features
- Add the option to cancel `idleTimeout` when sending zero as the value and add the option to send `detached` to `makeServerProcess`
### Bug fixes
- Fixed various issues during taking screenshots in landscape orientation on some native devices

## 2.9.6 - 2022/7/7

### Features
### Bug fixes
- Fixed bug where a failure in a single UFG environment fails all other environments in the same configuration

## 2.9.5 - 2022/7/5

### Features
### Bug fixes
- Fix auto-generated region ids

## 2.9.4 - 2022/6/30

### Features
### Bug fixes
- Implicitly convert tag to css selector due to removal of tag support from chromedriver

## 2.9.3 - 2022/6/27

### Features
- Add support for dynamic coded regions
### Bug fixes
- Improved handling of touch padding related issues in native apps
- Prevented navbar from appearing on Android 12 screenshots
- Improve the logic that detects the side of native Android navigation bar

## 2.9.2 - 2022/6/21

### Features
- Fixed webdriver proxy with self-signed certificates
### Bug fixes

## 2.9.1 - 2022/6/17

### Features
### Bug fixes
- Support self signed certificates in webdriver proxy
- Remove tunnel proxy since this functionality is already handled by default proxy

## 2.9.0 - 2022/6/17

### Features
- Support padding for regions in the following region types - ignoreRegions, layoutRegions, strictRegions, contentRegions
- Add proxy and tunneling support for connecting to the driver instance
### Bug fixes
- Fixed native screenshots of the elements under large collapsing areas
- Fixed scrolling on some android devices

## 2.8.0 - 2022/6/14

### Features
- Add special attribute for pseudo elements
- Add the ability for the SDK to lazy load the page prior to performing a check window
### Bug fixes

## 2.7.2 - 2022/6/10

### Features
### Bug fixes
- Fix rendering issues with Salesforce Lightning design system
- Fix issue that prevented self-signed certificates from working when connecting through a proxy server

## 2.7.1 - 2022/6/8

### Features
### Bug fixes
- Fix calling `waitBeforeCapture` when failed to set required viewport size

## 2.7.0 - 2022/6/8

### Features
- Add the option to send driver to check method
- Added Alpine Linux binaries
- Added support for taking full screenshots of elements that are scroll by pages only
- Allowed `` values in custom properties
### Bug fixes
- Fixed the "Maximum Call Stack Size Exceeded" error when taking screenshots on iOS Safari
- Fix how we send parameters to the cli from makeServerProcess
- Fixed an issue with wrong cropped screenshots of elements out of viewport bounds on native devices
- Fixed `forceFullPageScreenshot` option behavior

## 2.6.1 - 2022/6/2

### Features
### Bug fixes
- Fix rounding error of image size when scaling introduces fractions

## 2.6.0 - 2022/6/1

### Features
- Dorp support for Node.js versions <=12
### Bug fixes
- Fixed incorrect calculation of coded regions in classic mode when using CSS stitching

## 2.5.22 - 2022/6/1

### Features
### Bug fixes
- Improve request logging for commands to STDOUT, so the full object depth is visible

## 2.5.21 - 2022/5/27

### Features
### Bug fixes
- Fix issue with unexpected full-page screenshots

## 2.5.20 - 2022/5/27

### Features
- Added support for drivers that return screenshots in jpeg format
- Increased max payload size from 100Mb to 254Mb
### Bug fixes
- Fixed `CheckSetting`'s `fully` being overridden by `Configuration`'s `forceFullPageScreenshot`

## 2.5.19 - 2022/5/24

### Features
### Bug fixes
- exception in TestResultsSummary now should be accepted properly by universal clients, and we now also map `reason` when emitting an error for Eyes exceptions.

## 2.5.18 - 2022/5/24

### Features
- Added support for running server with SSL certificates
### Bug fixes
- Added retry mechanism for tunnel operations in EG client

## 2.5.17 - 2022/5/23

### Features
### Bug fixes
- Fixed bug in native apps when screenshot of the element was taken only for the small visible part of the element

## 2.5.16 - 2022/5/22

### Features
### Bug fixes
- Fixed bug in native apps when screenshot of the element was taken only for the small visible part of the element
- Fixed bug when navigation bar was presented in screenshot on Android 12

## 2.5.15 - 2022/5/19

### Features
### Bug fixes
- revert back to sending the config as a string to cli from universal-server-process

## 2.5.14 - 2022/5/19

### Features
### Bug fixes
- Fixed handling of navigation bar size on various devices

## 2.5.13 - 2022/5/18

### Features
### Bug fixes
- Added support for node versions >= 12.x

## 2.5.12 - 2022/5/18

### Features
### Bug fixes
- Improved body processing in EG client

## 2.5.11 - 2022/5/18

### Features
### Bug fixes
- Allow running with self-signed certificates

## 2.5.10 - 2022/5/17

### Features
### Bug fixes
- Fixed retry mechanism in EG client

## 2.5.9 - 2022/5/16

### Features
### Bug fixes
- Fix build settings

## 2.5.8 - 2022/5/16

### Features
- Improve EG client performance
- Add proxy support to EG client
### Bug fixes
- Fix request issues with EG client

## 2.5.7 - 2022/5/12

### Features
### Bug fixes
- Handle network errors in EG client

## 2.5.6 - 2022/5/12

### Features
- Replace `--eg` flag with `eg-client` command
### Bug fixes

## 2.5.5 - 2022/5/10

### Features
- add `--fork` flag to the cli to run server in the fork
### Bug fixes

## 2.5.4 - 2022/5/9

### Features
### Bug fixes
- handle `firstMatch` property during start session request in eg-client

## 2.5.3 - 2022/5/9

### Features
### Bug fixes
- Passthrough requests for execution grid client respond with a body now

## 2.5.2 - 2022/5/9

### Features
### Bug fixes
- Passthrough requests for execution grid client respond with a body now

## 2.5.1 - 2022/5/6

### Features
### Bug fixes
- improve logging around Eyes start session requests

## 2.5.0 - 2022/5/5

### Features
- Add execution grid tunnel support to the execution grid client
### Bug fixes

## 2.4.0 - 2022/5/4

### Features
- Add the ability to launch the execution grid client through a command-line argument
### Bug fixes

## 2.3.1 - 2022/5/4

### Features
### Bug fixes
- Make sure `ios` platformName is changed to `iOS` (fixing a bug in Java Appium)

## 2.3.0 - 2022/5/3

### Features
### Bug fixes
- Account for an Appium bug when calculating system bars height
- Make sure android platformName starts with uppercase if `config.keepPlatformNameAsIs` is set to true

## 2.2.8 - 2022/4/26

### Features
### Bug fixes
- Fixed check region fully in classic execution when using CSS stitching

## 2.2.7 - 2022/4/25

### Features
### Bug fixes
- Fix regression introduced when looking up driver capabilities

## 2.2.6 - 2022/4/25

### Features
### Bug fixes
- Fix non-W3C command being called when in W3C mode

## 2.2.5 - 2022/4/23

### Features
### Bug fixes
- Support `appium:` prefixed capabilities. Fixes support for Appium 8 in Java

## 2.2.4 - 2022/4/21

### Features
### Bug fixes
- fix the problem that intermittently we don't get all tested environments in the same batch

## 2.2.3 - 2022/4/20

### Features
### Bug fixes
- Support `version` in deviceInfo options

## 2.2.2 - 2022/4/20

### Features
### Bug fixes
- implicitly set `allowInvisibleElements` in Appium when running on native Android
- return the correct capabilities when running on native iOS

## 2.2.1 - 2022/4/18

### Features
### Bug fixes
- Support Android x-path in 'takeVHSes.js' (was 'accessibility id', iOS logic not changed)

## 2.2.0 - 2022/4/14

### Features
- Support passing 'serverUrl' and 'proxy' to VHS.
### Bug fixes
- Use Math.ceil instead of Math.round for viewportSize calculation when passed useCeilForViewportSize:true
- Support data urls in iframes

## 2.1.4 - 2022/4/14

### Features
### Bug fixes
- When running a native app on Android, in case we test a device in landscape mode, make sure to account for the navigation bar on the left or right and not at the bottom of the image.
- Support data urls in iframes

## 2.1.3 - 2022/4/9

### Features
### Bug fixes
- `extractText` now handles regions with common selector (`{type, selecor}`)

## 2.1.2 - 2022/4/8

### Features
### Bug fixes
- Native iOS, allow capturing NavigationBar and TabBar regions

## 2.1.1 - 2022/4/5

### Features
### Bug fixes
- `extractText` now supports selectors provided as a string (a regression introduced in `13.1.3`)

## 2.1.0 - 2022/4/5

### Features
- Support UFG for native mobile
### Bug fixes

## 2.0.4 - 2022/4/4

### Features
### Bug fixes
- accept ios and android lowercase as driver platformName capability when using custom grid

## 2.0.3 - 2022/4/4

### Features
### Bug fixes
- accept ios and android lowercase as driver platformName capability when using custom grid

## 2.0.2 - 2022/3/30

### Features
### Bug fixes
- `extractText` now supports regions that don't use hints while using `x`/`y` coordinates

## 2.0.1 - 2022/3/14

- update snippets to address Cypres universal (AUT is hosted in an iframe inside the Cypres shell)
- updated to @applitools/eyes-sdk-core@13.1.1 (from 13.1.0)
- updated to @applitools/visual-grid-client@15.10.1 (from 15.10.0)

## 2.0.0 - 2022/3/12

- update `Eyes.abort` so it fails gracefully when an Eyes instance is not found
- support AUTProxy
- support assigning 'scrollingElement' as 'body' or 'html' dom element
- rename manager.closeAllEyes to manager.closeManager
- add support for aborting unclosed Eyes sessions and returning their results as part of manager.closeManager
- updated to @applitools/eyes-sdk-core@13.1.0 (from 13.0.6)
- updated to @applitools/visual-grid-client@15.10.0 (from 15.9.0)

## 1.1.0 - 2022/2/20

- Add support to page coverage by adding `pageId` to `Eyes.check`.
- updated to @applitools/eyes-sdk-core@13.0.6 (from 13.0.4)
- updated to @applitools/visual-grid-client@15.9.0 (from 15.8.65)

## 1.0.9 - 2022/2/16

- handle issue when `process.send` is missing

## 1.0.8 - 2022/2/16

- fix image scaling on pages without viewport metatag
- fix safari's viewport detection on iOS devices
- enhance server start up protocol with ipc communication
- export `makeServerProcess` function to create a detached process
- add `--config` cli argument to provide server configuration as a json string instead of separate cli arguments (flags)
- updated to @applitools/eyes-sdk-core@13.0.4 (from 13.0.1)
- updated to @applitools/logger@1.0.11 (from 1.0.10)
- updated to @applitools/utils@1.2.13 (from 1.2.11)
- updated to @applitools/visual-grid-client@15.8.65 (from 15.8.63)

## 1.0.7 - 2022/2/4

- handle file system errors on logger
- updated to @applitools/eyes-sdk-core@13.0.1 (from 13.0.0)
- updated to @applitools/logger@1.0.10 (from 1.0.9)
- updated to @applitools/visual-grid-client@15.8.63 (from 15.8.62)

## 1.0.6 - 2022/1/19

- updated to @applitools/eyes-sdk-core@13.0.0 (from 12.24.14)
- updated to @applitools/visual-grid-client@15.8.62 (from 15.8.61)

### ⚠ BREAKING CHANGES
- change default behavior of `Eyes.check` command to take a full screenshot if screenshot target is a window

## 1.0.5 - 2022/1/17

- no changes

## 1.0.4 - 2022/1/17

- no changes

## 1.0.3 - 2022/1/17

- updated to @applitools/eyes-sdk-core@12.24.14 (from 12.24.10)
- updated to @applitools/visual-grid-client@15.8.61 (from 15.8.56)

## 1.0.2 - 2022/1/6

- fix W3C detection for browserstack capabilities
- handle shadow root element key
- updated to @applitools/logger@1.0.9 (from 1.0.8)

## 1.0.1 - 2022/1/5

- fix webdriver additional commands format

## 1.0.0 - 2022/1/5

- updated to @applitools/utils@1.2.11 (from 1.2.5)
- updated to @applitools/eyes-sdk-core@12.24.10 (from 12.24.9)
- updated to @applitools/visual-grid-client@15.8.56 (from 15.8.55)

## 0.2.3 - 2021/12/23

- updated to @applitools/eyes-sdk-core@12.24.9 (from 12.24.7)
- updated to @applitools/logger@1.0.8 (from 1.0.7)
- updated to @applitools/utils@1.2.5 (from 1.2.4)
- updated to @applitools/visual-grid-client@15.8.55 (from 15.8.53)

## 0.2.2 - 2021/12/20

- update nodejs version in binaries to 16 lts
- updated to @applitools/eyes-sdk-core@12.24.7 (from 12.24.6)
- updated to @applitools/visual-grid-client@15.8.53 (from 15.8.52)

## 0.2.1 - 2021/12/17

- updated to @applitools/eyes-sdk-core@12.24.6 (from 12.24.4)
- updated to @applitools/logger@1.0.7 (from 1.0.6)
- updated to @applitools/visual-grid-client@15.8.52 (from 15.8.48)

## 0.2.0 - 2021/11/23

- updated to @applitools/eyes-sdk-core@12.24.2 (from 12.23.12)
- updated to @applitools/logger@1.0.5 (from 1.0.4)
- updated to @applitools/utils@1.2.4 (from 1.2.3)
- updated to @applitools/visual-grid-client@15.8.47 (from 15.8.31)
- updated to @applitools/eyes-sdk-core@12.24.3 (from 12.24.2)
- updated to @applitools/eyes-sdk-core@12.24.4 (from 12.24.3)
- updated to @applitools/logger@1.0.6 (from 1.0.5)
- updated to @applitools/visual-grid-client@15.8.48 (from 15.8.47)

## 0.1.5 - 2021/9/27

- updated to @applitools/eyes-sdk-core@12.23.12 (from 12.23.7)
- updated to @applitools/visual-grid-client@15.8.31 (from 15.8.27)

## 0.1.4 - 2021/9/15

- replace `Session.init` with `Core.makeSDK`
- improve command tracking in debug mode
- update spec drivers to match latest requirements
- updated to @applitools/eyes-sdk-core@12.23.5 (from 12.23.1)
- updated to @applitools/utils@1.2.3 (from 1.2.2)
- updated to @applitools/visual-grid-client@15.8.25 (from 15.8.22)
- updated to @applitools/eyes-sdk-core@12.23.7 (from 12.23.5)
- updated to @applitools/visual-grid-client@15.8.27 (from 15.8.25)

## 0.1.3 - 2021/9/1

- fix default webdriver spec driver implementation for `isDriver` to allow driver declarations with `sessionId` and `serverUrl`

## 0.1.2 - 2021/9/1

- fix default webdriver spec driver implementation for `isDriver` to allow driver declarations with `sessionId` and `serverUrl`
## 0.1.1 - 2021/8/31

- add support for native screenshots and newest spec driver methods
- rename EyesManager.makeEyes to EyesManager.openEyes
- updated to @applitools/eyes-sdk-core@12.23.0 (from 12.21.1)
- updated to @applitools/utils@1.2.2 (from 1.2.0)
- updated to @applitools/visual-grid-client@15.8.21 (from 15.8.11)
- updated to @applitools/eyes-sdk-core@12.23.1 (from 12.23.0)
- updated to @applitools/visual-grid-client@15.8.22 (from 15.8.21)

## 0.1.0 - 2021/6/15

- updated to @applitools/eyes-sdk-core@12.21.1 (from 12.20.2)
- updated to @applitools/visual-grid-client@15.8.11 (from 15.8.8)

## 0.0.3 - 2021/6/1

- re-release

## 0.0.2 - 2021/6/1

- init
- updated to @applitools/eyes-sdk-core@12.20.2 (from 12.13.5)
- updated to @applitools/utils@1.2.0 (from 1.0.0)
- updated to @applitools/visual-grid-client@15.8.8 (from 15.5.11)
