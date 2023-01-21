import type {Referenceable} from '../public_api';
import PersistClassName from './util/decorators/PersistClassName.mjs';

/** A definition with some utility accessors defined. `JSON.stringify`es into the definition's `id` prop */
@PersistClassName('NamespacedDefinition')
export class NamespacedDefinition<T extends Referenceable> {

  /** The actual definition */
  public readonly def: T;

  public constructor(def: T) {
    this.def = def;
  }

  public get id(): string {
    return this.def.id;
  }

  public toJSON(): string {
    return this.id;
  }
}
