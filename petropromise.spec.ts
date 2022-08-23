import PetroPromise from './petropromise';

const DEFAULT_VALUE = 'default value';

describe('.then', () => {
  it('returns default passed value', () => {
    settledPromise().then((v) => expect(v).toEqual(DEFAULT_VALUE));
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
    settledPromise({ value: 5 })
      .then((v) => v * 3)
      .then((v) => expect(v).toEqual(15));
  });
});

describe('.catch', () => {
  it('returns default passed value', () => {
    settledPromise({ fail: true }).catch((v) => expect(v).toEqual(DEFAULT_VALUE));
  });

  it('returns value with multiple catches for same promise', () => {
    const checkFunc = (v: any) => expect(v).toEqual(DEFAULT_VALUE);
    const mainPromise = settledPromise({ fail: true });
    const promise1 = mainPromise.catch(checkFunc);
    const promise2 = mainPromise.catch(checkFunc);
    return Promise.allSettled([promise1, promise2]);
  });

  it('returns value with chaining', () => {
    settledPromise({ value: 5 })
      .then((v) => {
        throw v * 3;
      })
      .catch((v) => expect(v).toEqual(15));
  });
});

describe('.finally', () => {
  it('returns default passed value', () => {
    const checkFunc = () => (v: any) => expect(v).toBeUndefined();
    const successPromise = settledPromise().finally(checkFunc);
    const failPromise = settledPromise({ fail: true }).finally(checkFunc);
    return Promise.allSettled([successPromise, failPromise]);
  });

  it('returns value with multiple finallys for same promise', () => {
    const checkFunc = () => (v: any) => expect(v).toBeUndefined();
    const mainPromise = settledPromise();
    const promise1 = mainPromise.finally(checkFunc);
    const promise2 = mainPromise.finally(checkFunc);
    return Promise.allSettled([promise1, promise2]);
  });

  it('returns value with chaining', () => {
    const checkFunc = () => (v: any) => expect(v).toBeUndefined();
    const successPromise = settledPromise()
      .then((v) => v)
      .finally(checkFunc);
    const failPromise = settledPromise({ fail: true })
      .then((v) => v)
      .finally(checkFunc);
    return Promise.allSettled([successPromise, failPromise]);
  });
});

describe('.resolve', () => {
  it('resolves promise with passed value', () => {
    return PetroPromise.resolve(DEFAULT_VALUE).then((v) => expect(v).toEqual(DEFAULT_VALUE));
  });
});

describe('.reject', () => {
  it('rejects promise with passed value', () => {
    return PetroPromise.reject(DEFAULT_VALUE).catch((v) => expect(v).toEqual(DEFAULT_VALUE));
  });
});

describe('.all', () => {
  it('resolves all promises with success', () => {
    PetroPromise.all([settledPromise({ value: 'soup' }), settledPromise({ value: 'bread' })]).then(
      (v) => expect(v).toEqual(['soup', 'bread'])
    );
  });

  it('resolves all promises with one fail', () => {
    PetroPromise.all([settledPromise(), settledPromise({ fail: true })]).catch((v) =>
      expect(v).toEqual(DEFAULT_VALUE)
    );
  });
});

describe('.allSettled', () => {
  it('returns all promises on allSettled', () => {
    PetroPromise.allSettled([settledPromise(), settledPromise({ fail: true })]).then((v) =>
      expect(v).toEqual([
        { status: 'fulfilled', value: DEFAULT_VALUE },
        { status: 'rejected', reason: DEFAULT_VALUE },
      ])
    );
  });
});

describe('.race', () => {
  it('returns first settled promise on race', () => {
    PetroPromise.race([settledPromise({ value: 'bread' }), settledPromise({ value: 'soup' })]).then(
      (v) => expect(v).toEqual('bread')
    );
  });

  it('returns first settled promise on race with failing promises', () => {
    PetroPromise.race([
      settledPromise({ fail: true, value: 'bread' }),
      settledPromise({ fail: true, value: 'soup' }),
    ]).catch((v) => expect(v).toEqual('bread'));
  });
});

describe('.any', () => {
  it('returns first fullfilled promise', () => {
    PetroPromise.any([settledPromise({ value: 'bread' }), settledPromise({ value: 'soup' })]).then(
      (v: any) => expect(v).toEqual('bread')
    );
  });

  it('returns errors for failed promises', () => {
    PetroPromise.any([
      settledPromise({ fail: true, value: 'bread' }),
      settledPromise({ fail: true, value: 'soup' }),
    ]).catch((e: { errors: any }) => expect(e.errors).toEqual(['bread', 'soup']));
  });
});

function settledPromise({
  value = DEFAULT_VALUE,
  fail = false,
}: { value?: any; fail?: boolean } = {}) {
  return new PetroPromise((resolve, reject) => {
    fail ? reject(value) : resolve(value);
  });
}
