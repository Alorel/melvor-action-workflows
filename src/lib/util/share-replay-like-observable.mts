import type {Subscriber} from 'rxjs';
import {Observable} from 'rxjs';
import PersistClassName from '../decorators/PersistClassName.mjs';

/**
 * An observable class that functions a bit like `shareReplay()`
 * Supports an `init` function for when the first subscriber gets added & a `cleanup` function for when the last one
 * unsubs
 */
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

  /** Emitted event history */
  protected get events(): T[] {
    return this.events = [...this.getOnInitEvents()]; // eslint-disable-line no-return-assign
  }

  /** Emitted event history */
  protected set events(value: T[]) {
    Object.defineProperty(this, 'events', {
      configurable: true,
      enumerable: true,
      value,
      writable: true,
    });
  }

  /** Clean up after the last subscriber unsubscribes */
  protected abstract cleanup(): void;

  /** Get events start with */
  protected abstract getOnInitEvents(): T[];

  /** Init once the first subscriber subscribes */
  protected abstract init(): void;

  /** Call `.next()` on all subscribers */
  protected next(value: T): void {
    this.events.push(value);
    for (const sub of this.subscribers) {
      sub.next(value);
    }
  }
}
