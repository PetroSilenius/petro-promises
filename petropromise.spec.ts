const PetroPromise = Promise;

const DEFAULT_VALUE = 'default value';

describe('.then', () => {
  it('returns default passed value', () => {
    return settledPromise().then((v) => expect(v).toEqual(DEFAULT_VALUE));
  });

  it('returns value with multiple thens for same promise', () => {
    const checkFunc = (v: any) => expect(v).toEqual(DEFAULT_VALUE);
    const mainPromise = settledPromise();
    const promise1 = mainPromise.then(checkFunc);
    const promise2 = mainPromise.then(checkFunc);
    return Promise.allSettled([promise1, promise2]);
  });

  it('returns value with then and catch', () => {
    const checkFunc = (v: any) => expect(v).toEqual(DEFAULT_VALUE);
    const failFunc = () => expect(1).toEqual(2);
    const resolvePromise = settledPromise().then(checkFunc, failFunc);
    const rejectPromise = settledPromise({ fail: true }).then(failFunc, checkFunc);
    return Promise.allSettled([resolvePromise, rejectPromise]);
  });

  it('returns value with chaining', () => {
    return settledPromise({ value: 5 })
      .then((v) => v * 3)
      .then((v) => expect(v).toEqual(15));
  });
});

describe('.catch', () => {
  it('returns default passed value', () => {
    return settledPromise({ fail: true }).catch((v) => expect(v).toEqual(DEFAULT_VALUE));
  });

  it('returns value with multiple catches for same promise', () => {
    const checkFunc = (v: any) => expect(v).toEqual(DEFAULT_VALUE);
    const mainPromise = settledPromise({ fail: true });
    const promise1 = mainPromise.catch(checkFunc);
    const promise2 = mainPromise.catch(checkFunc);
    return Promise.allSettled([promise1, promise2]);
  });

  it('returns value with chaining', () => {
    return settledPromise({ value: 5 })
      .then((v) => {
        throw v * 3;
      })
      .catch((v) => expect(v).toEqual(15));
  });
});


function settledPromise({
  value = DEFAULT_VALUE,
  fail = false,
}: { value?: any; fail?: boolean } = {}): Promise<any> {
  return new PetroPromise((resolve, reject) => {
    fail ? reject(value) : resolve(value);
  });
}
