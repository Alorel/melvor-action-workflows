export interface SidebarContext {
  category(id: string, config?: CategoryConfig, builder?: (cat: Category) => void): Category;
}

export interface UiContext {
  create(props: ComponentProps, host: HTMLElement): HTMLElement;

  createStatic(template: string, host: HTMLElement): HTMLElement;

  createStore<T extends object>(props: T): ComponentStore<T>;
}

export interface ComponentProps {
  props?: string[];
  emits?: string[];
  $template?: string;
}

export type ComponentStore<T extends object> = T;

export class Category extends SidenavItem {
  item(id: string, config?: CategoryItemConfig, builder?: (item: CategoryItem) => void): CategoryItem;
  item(id: string, builder?: (item: CategoryItem) => void): CategoryItem;

  removeAllItems(): void;

  removeItem(id: string): void;
}

export interface Category extends CategoryElements {

}

export interface CategoryItemConfig {
  after?: string; // Places the item after another item by id. Cannot be present if before is defined.

  aside?: string | HTMLElement | null; // Text or HTMLElement to be displayed in the aside slot. Example: level (1/99) text on skills.

  asideClass?: string | null; // String separated classes to add to the asideEl

  before?: string; // Places the item before another item by id. Cannot be present if after is defined.

  icon?: string | HTMLElement | null; // Either a URL (string) or an HTMLElement to appear in the item's icon slot.

  iconClass?: string | null; // String separated classes to add to the iconEl

  ignoreToggle?: boolean | null; // Set to true if this item should be visible even if its parent category is hidden. Example: Combat Level under the Combat category.

  itemClass?: string | null; // String separated classes to add to the itemEl

  link?: string | null; // URL to open if this item is clicked

  name?: string | HTMLElement | null; // Override the displayed name (defaults to item id)

  nameClass?: string | null; // String separated classes to add to the nameEl

  onClick?: (() => void) | null; // Code to be executed if the item is clicked

  onRender?: (elements: CategoryItemElements) => void; // See notes below

  rootClass?: string | null; // String separated classes to add to the rootEl
}

export class CategoryItem extends SidenavItem {
  removeAllSubitems(): void;

  removeSubitem(id: string): void;

  subitem(id: string, config?: CategorySubmitemConfig, builder?: (v: CategorySubitem) => void): CategorySubitem;

  subitem(id: string, builder?: (v: CategorySubitem) => void): CategorySubitem;
}

export class CategorySubitem extends SidenavItem {
}

export interface CategorySubitem extends CategorySubitemElements {
}

export interface CategorySubmitemConfig {
  after?: string; // Places the item after another item by id. Cannot be present if before is defined.

  aside?: string | HTMLElement | null; // Text or HTMLElement to be displayed in the aside slot. Example: completion percentages in the Completion Log.

  asideClass?: string | null; // String separated classes to add to the asideEl

  before?: string; // Places the subitem before another subitem by id. Cannot be present if after is defined.

  link?: string | null; // URL to open if this item is clicked

  name?: string | HTMLElement | null; // Override the displayed name (defaults to subitem id)

  nameClass?: string | null; // String separated classes to add to the nameEl

  onClick?: (() => void) | null; // Code to be executed if the subitem is clicked

  onRender?: (elements: CategorySubitemElements) => void; // See notes below

  rootClass?: string | null; // String separated classes to add to the rootEl

  subitemClass?: string | null; // String separated classes to add to the subitemEl
}

export interface CategorySubitemElements {
  asideEl?: HTMLElement;

  nameEl: HTMLSpanElement;

  rootEl: HTMLLIElement;

  subitemEl: HTMLAnchorElement;
}

export class SidenavItem {
  id: string;

  click(): void;

  remove(): void;

  toggle(force?: boolean): void;
}

export interface CategoryItem extends CategoryItemElements {
}

export interface CategoryItemElements {
  asideEl?: HTMLElement;

  iconEl: HTMLSpanElement;

  itemEl: HTMLAnchorElement;

  nameEl: HTMLSpanElement;

  rootEl: HTMLLIElement;

  subMenuEl?: HTMLUListElement;
}

export interface CategoryConfig {
  // Places the category after another category by id. Cannot be present if before is defined.
  after?: string;

  // Places the category before another category by id. Cannot be present if after is defined.
  before?: string;

  // String separated classes to add to the categoryEl
  categoryClass?: string | null;

  // Override the displayed name (defaults to category id)
  name?: string | HTMLElement | null;

  // String separated classes to add to the nameEl
  nameClass?: string | null;

  // String separated classes to add to the rootEl
  rootClass?: string | null;

  // Determines if the category can be hidden (example: Combat & Non-Combat)
  toggleable?: boolean | null;

  // Code to execute if the category title is clicked
  onClick?(): void;

  onRender?(elements: CategoryElements): void;
}

interface CategoryElements {
  // The category's primary HTML element. This contains the nameEl and toggleEl, if defined.
  categoryEl: HTMLDivElement;

  // The category's name HTML element. This contains the defined name property.
  nameEl: HTMLSpanElement;

  // The category's root HTML element. This contains the categoryEl and all item's rootEl's.
  rootEl: HTMLLIElement;

  // The category's toggle HTML element (the visibility eyecon). This is undefined if the category's toggleable property is set to false or null.
  toggleEl?: HTMLElement;
}
