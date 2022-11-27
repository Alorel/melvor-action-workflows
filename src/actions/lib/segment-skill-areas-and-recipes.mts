import type {NamespaceRegistry} from 'melvor';
import type {TypedKeys} from 'mod-util/typed-keys';

/**
 * Segment skill recipes that have areas
 * @param areas Areas registry
 * @param innerKey Object key to segment by
 */
export function segmentSkillAreasAndRecipes<A extends object, R extends object>(
  areas: NamespaceRegistry<A>,
  innerKey: TypedKeys<A, R[]>
): WeakMap<R, A> {
  const out = new WeakMap<R, A>();

  for (const area of areas.registeredObjects.values()) {
    for (const recipe of area[innerKey] as R[]) {
      out.set(recipe, area);
    }
  }

  return out;
}
