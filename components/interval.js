import { atom, observe } from "elementos";

export const createInterval = (initialCallback, interval) => {
  const interval$ = atom(interval);
  let callback = initialCallback;
  const dispose = observe(interval$, (milliseconds) => {
    const id = setInterval(() => {
      callback();
    }, milliseconds);
    return () => {
      clearInterval(id);
    };
  });
  return {
    setInterval: interval$.actions.set,
    setCallback: (nextCallback) => {
      callback = nextCallback;
    },
    dispose
  };
};
