declare const game: import('./index').Game;

declare const Skill: typeof import('./index').Skill;
declare const Bank: typeof import('./index').Bank;
declare const NamespaceRegistry: typeof import('./index').NamespaceRegistry;
declare const NamespacedObject: typeof import('./index').NamespacedObject;
declare const EquipmentItem: typeof import('./index').EquipmentItem;
declare const SkillWithMastery: typeof import('./index').SkillWithMastery;
declare const AltMagicConsumptionID: typeof import('./index').AltMagicConsumptionID;

declare const ctx: import('./index').ModContext;
declare const ui: import('./index').UiContext;
declare const sidebar: import('./index').SidebarContext;

declare const Swal: (typeof import('sweetalert2'))['default'];

declare function cdnMedia(media: string): string;

declare const tippy: import('tippy.js').Tippy;

declare const mod: {
  api: Record<string, Record<string, any>>;

  getContext(meta: ImportMeta): import('./index').ModContext;
};
