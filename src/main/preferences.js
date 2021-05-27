import settings from 'electron-settings'
import { DEFAULT_HOTKEY } from '../../config'

const STORAGE_NAME = 'preferences'
const makeStorageKey = key => `${STORAGE_NAME}.${key}`
const HOTKEY_ACCESSOR = makeStorageKey('hotkey')

export default class Preferences {
  async getHotKey () {
    const hotKey = await settings.get(HOTKEY_ACCESSOR)
    if (hotKey === undefined) {
      await this.updateHotKey(DEFAULT_HOTKEY)
      return DEFAULT_HOTKEY
    }
    return hotKey
  }

  async updateHotKey (hotkey) {
    await settings.set(HOTKEY_ACCESSOR, hotkey)
  }
}
