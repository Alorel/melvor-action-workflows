import {get} from 'lodash-es';
import type {NamespaceRegistry as TNamespaceRegistry} from 'melvor';
import {defineOption} from '../../lib/api.mjs';
import {EMPTY_ARR} from '../../lib/util.mjs';
import {isUndefinedOr} from '../../lib/util/is-undefined-or.mjs';
import type {
  MediaItemNodeOption,
  MediaItemNodeOptionMultiConfig,
  MediaSelectable,
  NodeOptionBase,
  Obj
} from '../../public_api';
import {resolveMediaItemRegistry, resolveMediaMulti} from './render-media-commons.mjs';
import RenderMediaEdit from './render-media-edit';
import RenderMediaSelectView from './render-media-view';

export type MediaOptionValue = MediaSelectable | MediaSelectable[];

defineOption<MediaOptionValue, MediaItemNodeOption>({
  is: isMediaItemOption,
  renderEdit: RenderMediaEdit,
  renderView: RenderMediaSelectView,
  token: 'MediaItem',
  validate(
    value: MediaSelectable | MediaSelectable[] | undefined,
    opt: MediaItemNodeOption,
    values: Obj<any>
  ): string[] {
    if (value == null) {
      return EMPTY_ARR;
    }

    const registry = resolveMediaItemRegistry(opt.registry, values);
    const errors: string[] = registry ? [] : ['Registry not found'];

    const multi = resolveMediaMulti(opt.multi);
    if (multi) {
      if (!Array.isArray(value)) {
        errors.push('Expected array value');
      }

      if (errors.length) {
        return errors;
      } else if (!(value as any[]).length) {
        return EMPTY_ARR;
      }

      validateMulti(
        value as MediaSelectable[],
        multi,
        errors,
        registry!,
        opt,
        values
      );
    } else {
      if (Array.isArray(value)) {
        errors.push('Expected non-array value');
      }

      if (errors.length) {
        return errors;
      }

      validateItem(value as MediaSelectable, registry!, opt, values, errors);
    }

    return errors.length ? errors : EMPTY_ARR;
  },
});

export default function isMediaItemOption(v: NodeOptionBase & Obj<any>): v is MediaItemNodeOption {
  const {type, mediaFilter, registry, multi} = v;

  return type === 'MediaItem'
    && isUndefinedOr(mediaFilter, 'function')
    && (
      typeof registry === 'function'
      || (
        (typeof registry === 'string' || Array.isArray(registry)) && get(game, registry) instanceof NamespaceRegistry
      )
    )
    && (!multi || multi === true || isValidMultiConfig(multi));
}

function validateMulti<T extends MediaSelectable>(
  items: T[],
  multi: MediaItemNodeOptionMultiConfig,
  errors: string[],
  registry: TNamespaceRegistry<T>,
  opt: MediaItemNodeOption,
  values: Obj<any>
) {
  if (multi.maxLength && items.length >= multi.maxLength) {
    errors.push(`Too many items! Select ${multi.maxLength} at most.`);
  }

  for (let i = 0; i < items.length; ++i) {
    const item = items[i];
    if (item) {
      validateItem(item, registry!, opt, values, errors);
    } else {
      errors.push(`Item at index ${i} is empty`);
    }
  }
}

function validateItem<T extends MediaSelectable>(
  item: T,
  reg: TNamespaceRegistry<T>,
  {mediaFilter}: MediaItemNodeOption,
  otherOpts: Obj<any>,
  errors: string[]
): void {
  if (!reg.registeredObjects.has(item.id)) {
    errors.push(`Item not found in selected registry: ${item.name}`);
  }
  if (mediaFilter && !mediaFilter(item, otherOpts)) {
    errors.push(`Item doesn't pass filter: ${item.name}`);
  }
}

function isValidMultiConfig(v: any): v is MediaItemNodeOptionMultiConfig {
  if (v == null) {
    return false;
  }

  const length = v.maxLength;

  return length == null || (typeof length === 'number' && length > 0);
}

