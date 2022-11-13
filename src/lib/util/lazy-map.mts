import PersistClassName from '../decorators/PersistClassName.mjs';

@PersistClassName('LazyMap')
export class LazyMap<K, V> extends Map<K, V> {
  public constructor(private readonly factory: (key: K) => V, entries?: Iterable<[K, V]>) {
    super(entries);
  }

  public ensureGet(key: K): V {
    if (this.has(key)) {
      return this.get(key)!;
    }

    const value = this.factory(key);
    this.set(key, value);

    return value;
  }
}
