import type {ComponentType} from 'preact';
import type {NodeOptionBase, Obj} from '../public_api';
import {isOptionDefinition} from './public-api-validation.mjs';
import {OPTION_REGISTRY} from './registries/option-registry.mjs';
import {errorLog} from './util/log.mjs';

export interface OptionRenderEditCtx<Val, Interface> extends OptionRenderViewCtx<Val, Interface> {

  /** On change callback */
  onChange(value?: Val): void;
}

export interface OptionRenderViewCtx<Val, Interface> {

  /** The option definition */
  option: Interface;

  /** Other options' values */
  otherValues: Obj<any>;

  /** The current value */
  value?: Val;
}

export interface OptionDefinition<Val, Interface extends NodeOptionBase> {

  /**
   * Whether the option has a dedicated column for its label or not. The boolean option, for example, doesn't have one.
   * @default true
   */
  hasLabel?: boolean;

  /** Render the option in edit mode */
  renderEdit: ComponentType<OptionRenderEditCtx<Val, Interface>>;

  /** Render the option in view mode */
  renderView: ComponentType<OptionRenderViewCtx<Val, Interface>>;

  /** The option's identifier. Should match the {@link NodeOptionBase#type type} prop value on your interface */
  token: Interface['type'];

  /** Validate the schema */
  is(v: NodeOptionBase & Obj<any>): v is Interface;

  /**
   * Validate the value
   * @param value The option's value
   * @param def The option's definition
   * @param fullOptsObject Other options' values
   */
  validate?(value: Val | undefined, def: Interface, fullOptsObject: Obj<any>): string[];
}

/** Define a new option type */
export function defineOption<Val, Interface extends NodeOptionBase>(opt: OptionDefinition<Val, Interface>): void {
  if (!isOptionDefinition(opt)) {
    throw new Error('Option definition doesn\'t match schema');
  } else if (OPTION_REGISTRY.has(opt.token)) {
    errorLog(opt.token);
    throw new Error('Duplicate option token; see console.error prior');
  }

  if (!process.env.PRODUCTION) {
    if (!opt.renderView.displayName) {
      opt.renderView.displayName = `View[${opt.token}]`;
    }
    if (!opt.renderEdit.displayName) {
      opt.renderEdit.displayName = `Edit[${opt.token}]`;
    }
  }

  OPTION_REGISTRY.set(opt.token, opt);
}
