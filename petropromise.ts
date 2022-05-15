type Callback = (data: any, err?: Error | any) => void;

const enum State {
  FULFILLED = 'fulfilled',
  REJECTED = 'rejected',
  PENDING = 'pending',
}

class PetroPromise {
  #state = State.PENDING;
  #value: any;
  #thenCallbacks: Callback[] = [];
  #catchCallbacks: Callback[] = [];
  #onSuccessBind = this.#onSuccess.bind(this);
  #onFailBind = this.#onFail.bind(this);

  constructor(callback: Callback) {
    try {
      callback(this.#onSuccessBind, this.#onFailBind);
    } catch (e) {
      this.#onFail(e);
    }
  }

  #runCallbacks() {
    if (this.#state === State.FULFILLED) {
      this.#thenCallbacks.forEach((callback) => callback(this.#value));
      this.#thenCallbacks = [];
    } else if (this.#state === State.REJECTED) {
      this.#catchCallbacks.forEach((callback) => callback(this.#value));
      this.#catchCallbacks = [];
    }
  }

  #onSuccess(value: any) {
    if (this.#state !== State.PENDING) return;
    this.#state = State.FULFILLED;
    this.#value = value;
    this.#runCallbacks();
  }

  #onFail(value: any) {
    if (this.#state !== State.PENDING) return;
    this.#state = State.REJECTED;
    this.#value = value;
    this.#runCallbacks();
  }

  then(thenCallback?: Callback, catchCallback?: Callback) {
    if (thenCallback) this.#thenCallbacks.push(thenCallback);
    if (catchCallback) this.#catchCallbacks.push(catchCallback);
    this.#runCallbacks();
  }

  catch(callback: Callback) {
    this.then(undefined, callback);
  }

  finally(callback: Callback) {
    this.then(callback, callback);
  }
}

export default PetroPromise;
