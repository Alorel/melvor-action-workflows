import type {Subscriber} from 'rxjs';
import {Observable} from 'rxjs';
import PersistClassName from '../decorators/PersistClassName.mjs';

@PersistClassName('ShareReplayLike')
export default abstract class ShareReplayLike<T> extends Observable<T> {
  protected readonly subscribers = new Set<Subscriber<T>>();

  public constructor() {
    super(subscriber => {
      this.subscribers.add(subscriber);
      for (const evt of this.events) {
        subscriber.next(evt);
      }
      if (this.subscribers.size === 1) {
        this.init();
      }

      return () => {
        this.subscribers.delete(subscriber);
        if (!this.subscribers.size) {
          this.cleanup();
        }
      };
    });
  }

  protected get events(): T[] {
    return this.events = this.getOnInitEvents(); // eslint-disable-line no-return-assign
  }

  protected set events(value: T[]) {
    Object.defineProperty(this, 'events', {
      configurable: true,
      enumerable: true,
      value,
      writable: true,
    });
  }

  protected abstract cleanup(): void;

  protected abstract getOnInitEvents(): T[];

  protected abstract init(): void;

  protected next(value: T): void {
    this.events.push(value);
    for (const sub of this.subscribers) {
      sub.next(value);
    }
  }
}
