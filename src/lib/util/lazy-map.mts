import PersistClassName from '../decorators/PersistClassName.mjs';

/** A Map that can lazily instantiate keys */
@PersistClassName('LazyMap')
export class LazyMap<K, V> extends Map<K, V> {
  public constructor(private readonly factory: (key: K) => V, entries?: Iterable<[K, V]>) {
    super(entries);
  }

  /** Get the value for the key, creating it if it doesn't exist */
  public ensureGet(key: K): V {
    if (this.has(key)) {
      return this.get(key)!;
    }

    const value = this.factory(key);
    this.set(key, value);

    return value;
  }
}
