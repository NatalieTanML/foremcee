import settings from 'electron-settings';
import { STORAGE_NAME, DEFAULT_HOTKEY } from '../config';

const makeStorageKey = (key: string) => `${STORAGE_NAME}.${key}`;
const HOTKEY_ACCESSOR = makeStorageKey('hotkey');

export default class Preferences {
  async getHotKey(): Promise<string> {
    const hotKey = await settings.get(HOTKEY_ACCESSOR);
    if (hotKey === undefined) {
      await this.updateHotKey(DEFAULT_HOTKEY);
      return DEFAULT_HOTKEY;
    }
    return hotKey as string;
  }

  // eslint-disable-next-line class-methods-use-this
  async updateHotKey(hotkey: string): Promise<void> {
    await settings.set(HOTKEY_ACCESSOR, hotkey);
  }
}
