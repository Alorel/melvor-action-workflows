import type {Referenceable} from '../public_api';

export class NamespacedDefinition<T extends Referenceable> {
  public readonly def: T;

  public constructor(def: T) {
    this.def = def;
  }

  public get id(): string {
    return `${this.namespace}:${this.localID}`;
  }

  public get localID(): string {
    return this.def.localID;
  }

  public get namespace(): string {
    return this.def.namespace;
  }

  public toJSON(): string {
    return this.id;
  }
}
