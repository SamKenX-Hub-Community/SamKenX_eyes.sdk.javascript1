import { getScreenshot } from "../utils/screenshot";
import { getEyes } from "../utils/eyes";

export function checkWindow(tabId, windowId, viewport, forceFullPageScreenshot = true, removeScrollBars = false) {
  const eyes = getEyes();
  return eyes.open("Selenium IDE", "Visual test!!!!", viewport).then(() => {
    return getScreenshot(tabId, windowId, forceFullPageScreenshot, removeScrollBars, viewport).then((image) => {
      const image64 = image.replace("data:image/png;base64,", "");
      return eyes.checkImage(image64, "Education");
    });
  }).then(() => {
    eyes.close(false);
  }).catch((e) => {
    console.error(e);
    eyes.abortIfNotClosed();
  });
}
