import browser from 'webextension-polyfill'

export const DEFAULT_SERVER = 'https://eyes.applitools.com/'
export const DEFAULT_API_SERVER = 'https://eyesapi.applitools.com/'

export async function verifyStoredAPIKey() {
  const { apiKey, eyesServer } = await browser.storage.local.get(['apiKey', 'eyesServer'])
  if (!apiKey) {
    throw new Error("API key can't be empty")
  } else {
    const response = await fetch(
      `${new URL('/api/auth/access', eyesServer || DEFAULT_API_SERVER).href}?accessKey=${apiKey}&format=json`
    )
    if (response.ok) {
      try {
        const { isFree } = await response.json()
        await browser.storage.local.set({ isFree: !!isFree })
        return
      } catch (e) {
        await browser.storage.local.set({ isFree: false })
        return
      }
    } else {
      throw new Error('Unable to verify API check, verify the key and server correctness')
    }
  }
}

export async function getEmulatedDevices() {
  try {
    const response = await fetch('https://render-wus.applitools.com/emulated-devices')
    if (response.ok) {
      const {devices} = await response.json()
      return devices.map(d => d.deviceName)
    }
  } catch(error) {
    throw new Error(error)
  }
}
