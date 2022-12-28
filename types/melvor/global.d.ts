declare const game: import('./index').Game;

declare const Skill: typeof import('./index').Skill;
declare const Player: typeof import('./index').Player;
declare const PetManager: typeof import('./index').PetManager;
declare const Bank: typeof import('./index').Bank;
declare const NamespaceRegistry: typeof import('./index').NamespaceRegistry;
declare const AttackTypeID: typeof import('./index').AttackTypeID;
declare const CombatManager: typeof import('./index').CombatManager;
declare const EquippedFood: typeof import('./index').EquippedFood;
declare const FoodItem: typeof import('./index').FoodItem;
declare const Enemy: typeof import('./index').Enemy;
declare const NamespacedObject: typeof import('./index').NamespacedObject;
declare const EquipmentItem: typeof import('./index').EquipmentItem;
declare const Equipment: typeof import('./index').Equipment;
declare const SkillWithMastery: typeof import('./index').SkillWithMastery;
declare const AltMagicConsumptionID: typeof import('./index').AltMagicConsumptionID;
declare const GP: typeof import('./index').GP;
declare const SlayerCoins: typeof import('./index').SlayerCoins;

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
