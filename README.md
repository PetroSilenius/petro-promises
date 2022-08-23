# PetroPromises

This is a simple recreation of Javascript `Promises` to get a better grasp of them. The implementation is heavily inspired by Web Dev Simplifieds [video on How To Create Your Own Implementation Of JavaScript Promises
](https://www.youtube.com/watch?v=1l4wHWQCCIc).

The implementation is lackluster and not meant for any kind of real usage. It was done for the sole reason of better understanding the inner workings of `Promises`.

## Implemented functionalities

- .then
- .catch
- .finally
- .all
- .allSettled
- .race
- .any
- .resolve (uses an actual promise)
- .reject (uses an actual promise)

- chaining
- UncaughtPromiseError

## Getting Started

Clone the repository

```bash
  git clone https://github.com/PetroSilenius/petro-promises.git
```

Change to the project directory

```bash
  cd petro-promises
```

Install project dependencies (jest and typescript)

```bash
  npm install
```

Run tests in watch mode

```bash
  npm test:watch
```

You can compare the implementation with the original one by changing the switching the commendted lines on rows 1-2 in `petropromise.spec.ts`.

## Learn More

Click on the links to learn more about Promises

- [MDN docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [W3Schools](https://www.w3schools.com/js/js_promise.asp)
