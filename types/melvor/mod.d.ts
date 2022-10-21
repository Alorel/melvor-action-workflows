import type {Class, InstanceOf} from 'mod-util/class';

export interface ModContext {
  accountStorage: ModStorage;

  characterStorage: ModStorage;

  gameData: ModGameData;

  /** Execute code after the player's chosen character has loaded and all game objects are created, but before offline progress calculations. */
  onCharacterLoaded: ModLifecycleCallback;

  /** Execute code after the the character selection screen has fully loaded. */
  onCharacterSelectionLoaded: ModLifecycleCallback;

  /** Execute code after offline progress has been calculated and all in-game user interface elements have been created. */
  onInterfaceReady: ModLifecycleCallback;

  /** Execute code after all mods have been loaded (character select screen). */
  onModsLoaded: ModLifecycleCallback;

  settings: ModSettingsCtx;

  api<T>(exposedApi: T): void;

  getResourceUrl(localPath: string): string;

  loadTemplates(path: string): void;

  patch<O extends Class<any>, M extends keyof InstanceOf<O>>(source: O, method: M): PatchOf<O, M>;
}

export interface ModGameData {
  /** @see https://melvoridle.com/assets/schema/gameData.json */
  addPackage(pkg: string | Record<string, any>): Promise<void>;
}

export type ModLifecycleCallback = (callback: (ctx: ModContext) => void | Promise<void>) => void;

export interface ModSettingsCtx {
  section(name: string): ModSettingsSection;
}

export interface ModDropdownOption<V> {
  display: string | HTMLElement;

  value: V;
}

export interface ModCheckboxOption<V> extends ModDropdownOption<V> {
  hint?: string | HTMLElement;
}

export const enum ModSettingType {
  TEXT = 'text',
  NUMBER = 'number',
  SWITCH = 'switch',
  DROPDOWN = 'dropdown',
  BUTTON = 'button',
  CHECKBOX_GROUP = 'checkbox-group',
  RADIO_GROUP = 'radio-group',
  LABEL = 'label',
}

export const enum ModColour {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  SUCCESS = 'success',
  INFO = 'info',
  WARNING = 'warning',
  DANGER = 'danger',
  DARK = 'dark',
}

export interface ModSettingsConfig<V> {
  color?: ModColour;

  default?: V;

  hint?: string | HTMLElement;

  label: string | HTMLElement;

  name: string;

  options?: ModDropdownOption<V>[] | ModCheckboxOption<V>[];

  type: ModSettingType | string;

  onChange?(value: V, previousValue?: V): void | boolean | string;

  onClick?(): void;

  [k: string]: any;
}

export interface ModSettingsSection {
  /** Adds a setting to the section. The order that settings are added to a section are the order they will display in a mod's settings window. */
  add(config: ModSettingsConfig<any> | ModSettingsConfig<any>[]): void;
}

export interface Patch<A extends any[], R, O> {
  after(callback: (this: InstanceOf<O>, returnValue: R, ...args: A) => void): void;

  before(callback: (this: InstanceOf<O>, ...args: A) => void | A): void;

  /**
   * The replace method on the patch object will override the patched method's body, but before and after hooks will
   * still be executed. The replacement method will receive the current method implementation (the one being replaced)
   * along with the arguments used to call it as parameters. The return value of the replacement method will be the
   * return value of the method call, subject to any changes made in an after hook.
   */
  replace(callback: (this: InstanceOf<O>, orig: (this: InstanceOf<O>, ...args: A) => R, ...args: A) => R): void;
}

type PatchOf<O extends object, M extends keyof InstanceOf<O>> = InstanceOf<O>[M] extends (...args: infer A) => infer R
  ? Patch<A, R, O>
  : never;

export interface ModStorage {
  clear(): void;

  getItem<T>(key: string): T | undefined;

  removeItem(key: string): void;

  setItem<T>(key: string, value: T): void;
}
