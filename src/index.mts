import type {ModContext} from 'melvor';

declare const ctx: ModContext;

const {
  accountStorage,
  onCharacterLoaded,
} = ctx;

onCharacterLoaded(() => {
  console.debug('##toon loaded');
  console.debug('##', accountStorage.getItem('mfoo'));
  accountStorage.setItem('mfoo', Date.now());
  console.debug('##', accountStorage.getItem('mfoo'));
});

// ctx.patch(Skill, 'addXP').after(function(leveledUp) {
//   if (!leveledUp) {
//     return;
//   }
//
//
// });

// ctx.onInterfaceReady(ctx => {
//   ctx.settings.section('Potato Section').add({
//     label: 'Pot@t:',
//     name: 'potat',
//     options: [...game.skills.registeredObjects.values()]
//       .map((value): ModDropdownOption<MelvorSkill> => ({
//         display: value.localID,
//         value,
//       })),
//     type: ModSettingType.DROPDOWN,
//   });
// });
