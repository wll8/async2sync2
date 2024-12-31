# async2sync2

## Project Introduction

`async2sync2` is a tool that converts asynchronous functions into synchronous functions. It achieves synchronous execution of asynchronous functions by extracting the function source code into a separate JavaScript file and running it.

## Installation

```bash
npm install async2sync2
```

## Usage

```javascript
const { async2sync2 } = require('async2sync2');

const asyncFn = async (a, b) => {
  return a + b;
};

const result = async2sync2(asyncFn)(1, 2);
console.log(result); // Output: 3
```

## Configuration Options

- `tempDir`: Temporary file storage directory
- `clearTemp`: Whether to clear temporary files, default is `true`
- `returnDetail`: Whether to return detailed information, default is `false`
- `cb`: Error callback function

Here is an example using all configuration options:

```javascript
const asyncFn = async (a, b) => {
  return a + b
}
const { res } = async2sync2(asyncFn, {
  returnDetail: true,
})(1, 2)
expect(res).toStrictEqual(3)
```

## Running Tests

```bash
npm test
```

## License

MIT