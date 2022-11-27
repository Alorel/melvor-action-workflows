/** Automatically assign a new auto-incremented number value to this field for each new class instance */
export default function AutoIncrement(startingValue = -1): PropertyDecorator {
  let id = startingValue;

  return (target, prop) => {
    Object.defineProperty(target, prop, {
      configurable: true,
      enumerable: true,
      get() {
        const value = ++id;
        Object.defineProperty(this, prop, {
          configurable: true,
          enumerable: true,
          value,
        });

        return value;
      },
    });
  };
}
