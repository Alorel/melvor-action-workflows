/** Persist class name post-minification */
export default function PersistClassName(name: string): ClassDecorator {
  return target => {
    Object.defineProperty(target, 'name', {enumerable: true, value: name});
    if (!(Symbol.toStringTag in target.prototype)) {
      Object.defineProperty(target.prototype, Symbol.toStringTag, {
        configurable: true,
        value: name,
        writable: true,
      });
    }
  };
}
