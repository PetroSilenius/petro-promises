type Callback<T = any> = (data?: T, err?: Error | T) => void;

const enum State {
  FULFILLED = 'fulfilled',
  REJECTED = 'rejected',
  PENDING = 'pending',
}

class UncaughtPromiseError extends Error {
  constructor(error: any) {
    super(error);

    this.stack = `(in promise) ${error.stack}`;
  }
}

class PetroPromise<T = any> {
  #state = State.PENDING;
  #value: T;
  #thenCallbacks: Callback<T>[] = [];
  #catchCallbacks: Callback<T>[] = [];
  #onSuccessBind = this.onSuccess.bind(this);
  #onFailBind = this.onFail.bind(this);

  constructor(callback: Callback) {
    try {
      callback(this.#onSuccessBind, this.#onFailBind);
    } catch (e: any) {
      this.onFail(e);
    }
  }

  private runCallbacks() {
    if (this.#state === State.FULFILLED) {
      this.#thenCallbacks.forEach((callback) => callback(this.#value));
      this.#thenCallbacks = [];
    } else if (this.#state === State.REJECTED) {
      this.#catchCallbacks.forEach((callback) => callback(this.#value));
      this.#catchCallbacks = [];
    }
  }

  private onSuccess(value: T) {
    queueMicrotask(() => {
      if (this.#state !== State.PENDING) return;

      if (value instanceof PetroPromise) {
        value.then(this.#onSuccessBind, this.#onFailBind);
        return;
      }

      this.#state = State.FULFILLED;
      this.#value = value;
      this.runCallbacks();
    });
  }

  private onFail(value: T) {
    queueMicrotask(() => {
      if (this.#state !== State.PENDING) return;

      if (value instanceof PetroPromise) {
        value.then(this.#onSuccessBind, this.#onFailBind);
        return;
      }

      if (this.#catchCallbacks.length === 0) {
        throw new UncaughtPromiseError(value);
      }

      this.#state = State.REJECTED;
      this.#value = value;
      this.runCallbacks();
    });
  }

  then(thenCallback?: Callback<T>, catchCallback?: Callback<T>) {
    return new PetroPromise((resolve, reject) => {
      this.#thenCallbacks.push((result) => {
        try {
          if (thenCallback) {
            resolve(thenCallback(result));
          } else {
            resolve(result);
          }
        } catch (e) {
          reject(e);
        }
      });

      this.#catchCallbacks.push((result) => {
        try {
          if (catchCallback) {
            resolve(catchCallback(result));
          } else {
            reject(result);
          }
        } catch (e) {
          reject(e);
        }
      });

      this.runCallbacks();
    });
  }

  catch(callback: Callback<T>) {
    return this.then(undefined, callback);
  }

  finally(callback: Callback<T>) {
    return this.then(
      (result) => {
        callback();
        return result;
      },
      (result) => {
        callback();
        throw result;
      }
    );
  }

  static resolve(value: any) {
    return new Promise((resolve) => resolve(value));
  }

  static reject(value: any) {
    return new Promise((resolve, reject) => reject(value));
  }

  static all(promises: PetroPromise[]) {
    return new PetroPromise((resolve, reject) => {
      let results: PetroPromise[] = [];

      promises.forEach((promise, index) => {
        promise.then(
          (value) => {
            results[index] = value;

            if (results.length === promises.length) {
              resolve(results);
            }
          },
          (error) => {
            reject(error);
          }
        );
      });
    });
  }

  static allSettled(promises: PetroPromise[]) {
    return new PetroPromise((resolve, reject) => {
      type Result = {
        status: State;
        value?: any;
        reason?: any;
      };

      let results: Result[] = [];

      promises.forEach((promise, index) => {
        promise
          .then((value) => {
            results[index] = { status: State.FULFILLED, value };
          })
          .catch((error) => {
            results[index] = { status: State.REJECTED, reason: error };
          })
          .finally(() => {
            if (results.length === promises.length) {
              resolve(results);
            }
          });
      });
    });
  }

  static race(promises: PetroPromise[]) {
    return new PetroPromise((resolve, reject) => {
      promises.forEach((promise) => {
        promise.then(resolve).catch(reject);
      });
    });
  }

  static any(promises: PetroPromise[]) {
    let errors: Error[] = [];
    return new PetroPromise((resolve, reject) => {
      promises.forEach((promise, index) => {
        promise.then(resolve).catch((value) => {
          errors[index] = value;

          if (errors.length === promises.length) {
            reject(new AggregateError(errors, 'All promises rejected'));
          }
        });
      });
    });
  }
}

export default PetroPromise;
