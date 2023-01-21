import type {Writable} from 'mod-util/writable';
import ActionId from '../../actions/action-id.mjs';
import TriggerId from '../../triggers/trigger-id.mjs';
import type {DataUpdateFn} from '../data-update.mjs';
import type {ActionsConfigItemJson} from '../data/action-config-item.mjs';
import type {WorkflowTriggerJson} from '../data/workflow-trigger.mjs';
import type {WorkflowJson} from '../data/workflow.mjs';
import {errorLog} from '../util/log.mjs';

const update0003: DataUpdateFn = (workflows: WorkflowJson[]) => {
  if (!workflows.length) {
    return; // Good stuff
  }

  const mkId = (baseId: string): string => `ActionWorkflows:${baseId}`;

  // Trigger map
  const triggerMap = new Map<string, TriggerId>([
    [mkId('mobAtkType'), TriggerId.CombatEnemyAtkType],
    [mkId('mobID'), TriggerId.CombatEnemyId],
    [mkId('enemyAtk'), TriggerId.CombatSpecialAttack],
    [mkId('prayerPoints'), TriggerId.CombatPrayerPoints],
    [mkId('and'), TriggerId.CombinationAnd],
    [mkId('or'), TriggerId.CombinationOr],
    [mkId('equippedFoodQty'), TriggerId.CoreEquippedFoodCount],
    [mkId('equippedQty'), TriggerId.CoreEquippedItemCount],
    [mkId('idle'), TriggerId.CoreIdle],
    [mkId('itemCharges'), TriggerId.CoreItemCharges],
    [mkId('itemQty'), TriggerId.CoreItemQty],
    [mkId('lvGained'), TriggerId.CoreLevelGained],
    [mkId('masteryLvl'), TriggerId.CoreMasteryLevel],
    [mkId('masteryPool'), TriggerId.CoreMasteryPool],
    [mkId('petUnlocked'), TriggerId.CorePetUnlocked],
    [mkId('gp'), TriggerId.CurrencyGold],
    [mkId('slayerCoins'), TriggerId.CurrencySlayer],
  ]);

  // Action map
  const actionMap = new Map<string, ActionId>([
    [mkId('activatePrayers'), ActionId.CombatActivatePrayers],
    [mkId('castStdSpell'), ActionId.CombatCastSpellStd],
    [mkId('castAncientSpell'), ActionId.CombatCastSpellAncient],
    [mkId('castArchaicSpell'), ActionId.CombatCastSpellArchaic],
    [mkId('castAurora'), ActionId.CombatCastSpellAurora],
    [mkId('castCurse'), ActionId.CombatCastSpellCurse],
    [mkId('setAtkStyle'), ActionId.CombatSetAttackStyle],
    [mkId('startCombatStd'), ActionId.CombatStartCombatStd],
    [mkId('startCombatSlayer'), ActionId.CombatStartCombatSlayer],
    [mkId('startCombatDung'), ActionId.CombatStartCombatDungeon],
    [mkId('BuyItem'), ActionId.CoreBuyItem],
    [mkId('wait'), ActionId.CoreDelay],
    [mkId('equipFood'), ActionId.CoreEquipFood],
    [mkId('equipItem'), ActionId.CoreEquipItem],
    [mkId('sellItem'), ActionId.CoreSellItem],
    [mkId('setStepIdx'), ActionId.CoreSetStepIdx],
    [mkId('equipSet'), ActionId.CoreSwitchEquipmentSets],
    [mkId('usePotion'), ActionId.CoreUsePotion],
    [mkId('startAgility'), ActionId.StartSkillAgility],
    [mkId('startAltMagic'), ActionId.StartSkillAltMagic],
    [mkId('startAstro'), ActionId.StartSkillAstrology],
    [mkId('startCooking'), ActionId.StartSkillCooking],
    [mkId('startCrafting'), ActionId.StartSkillCrafting],
    [mkId('startFiremaking'), ActionId.StartSkillFiremaking],
    [mkId('startFishing'), ActionId.StartSkillFishing],
    [mkId('startFletching'), ActionId.StartSkillFletching],
    [mkId('startHerblore'), ActionId.StartSkillHerblore],
    [mkId('startMining'), ActionId.StartSkillMining],
    [mkId('startRC'), ActionId.StartSkillRunecrafting],
    [mkId('startSmithing'), ActionId.StartSkillSmithing],
    [mkId('startSummmon'), ActionId.StartSkillSummoning],
    [mkId('startThieving'), ActionId.StartSkillThieving],
    [mkId('startWoodcutting'), ActionId.StartSkillWoodcutting],
  ]);

  outer:
  for (let i = workflows.length - 1; i > -1; --i) {
    const [workflowName, stepsJson] = workflows[i];

    for (const [triggerJson, actionsArrayJson] of stepsJson) {
      // Patch trigger ID
      const oldTriggerId = triggerJson[0];
      const newTriggerId = triggerMap.get(oldTriggerId);
      if (!newTriggerId) {
        errorLog(`Failed to migrate triggers of workflow ${workflowName}: no mapping found for trigger ${oldTriggerId}`);
        workflows.splice(i, 1);
        continue outer;
      }
      (triggerJson as Writable<WorkflowTriggerJson>)[0] = newTriggerId as unknown as string;

      for (const stepActionJson of actionsArrayJson) {
        // Patch action IDs
        const oldActionId = stepActionJson[0];
        const newActionId = actionMap.get(oldActionId);
        if (!newActionId) {
          errorLog(`Failed to migrate triggers of workflow ${workflowName}: no mapping found for action ${oldActionId}`);
          workflows.splice(i, 1);
          continue outer;
        }

        (stepActionJson as Writable<ActionsConfigItemJson>)[0] = newActionId as unknown as string;
      }
    }
  }
};

export default update0003;
