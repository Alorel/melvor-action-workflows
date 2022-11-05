import {LazyGetter} from 'lazy-get-decorator';

export default class LazyValue<T> {
  private readonly f: () => T;

  public constructor(factory: () => T) {
    this.f = factory;
  }

  @LazyGetter()
  public get value(): T {
    return this.f();
  }

  public get(): T {
    return this.value;
  }
}
