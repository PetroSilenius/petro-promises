type Callback = (data?: any, err?: Error | any) => void;

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

class PetroPromise {
  #state = State.PENDING;
  #value: any;
  #thenCallbacks: Callback[] = [];
  #catchCallbacks: Callback[] = [];
  #onSuccessBind = this.onSuccess.bind(this);
  #onFailBind = this.onFail.bind(this);

  constructor(callback: Callback) {
    try {
      callback(this.#onSuccessBind, this.#onFailBind);
    } catch (e) {
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

   private onSuccess(value: any) {
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

  private onFail(value: any) {
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

  then(thenCallback?: Callback, catchCallback?: Callback) {
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

  catch(callback: Callback) {
    return this.then(undefined, callback);
  }

  finally(callback: Callback) {
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
      let results: any[] = [];

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
      let results: any[] = [];

      promises.forEach((promise, index) => {
        promise.then(
          (value) => {
            results[index] = {status: State.FULFILLED, value};
          }
        ).catch( (error) => {
            results[index] = {status: State.REJECTED, value: error};
        }
        ).finally(() => {
            if (results.length === promises.length) {
              resolve(results);
            }
        });
      });
    });
  }
}

export default PetroPromise;
