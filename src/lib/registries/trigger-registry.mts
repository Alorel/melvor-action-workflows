import type {Subscriber} from 'rxjs';
import type {TriggerDefinitionContext} from '../data/trigger-definition-context.mjs';
import PersistClassName from '../decorators/PersistClassName.mjs';

/** All possible triggers */
export const TRIGGER_REGISTRY = new NamespaceRegistry<TriggerDefinitionContext<any>>(game.registeredNamespaces);

@PersistClassName('TriggerListener')
export class TriggerListener<T extends object = {}> {
  private readonly _sub: Subscriber<void>;

  public constructor(
    public readonly ctx: TriggerDefinitionContext<T>,
    public readonly data: T,
    sub: Subscriber<void>
  ) {
    this._sub = sub;
  }

  /** Check if the trigger's condition currently passes */
  public check(): boolean {
    return this.ctx.def.check(this.data);
  }

  /** Notify the subscriber about the trigger firing */
  public notify(): void {
    this._sub.next();
  }
}
