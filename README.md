# Coffeelint loader for Webpack

## Install

```sh
$ yarn add https://github.com/jbox-web/coffeelint-loader.git
```

## Usage

In your Webpack configuration:

```js
module.exports = {
  test: /\.coffee$/,
  enforce: 'pre',
  exclude: /node_modules/,
  loader: 'coffee-lint-loader'
}
```

## Options

You can pass directly some [coffeelint options](http://www.coffeelint.org/#options) by

- Adding a query string to the loader:

```js
module.exports = {
  test: /\.coffee$/,
  enforce: 'pre',
  exclude: /node_modules/,
  loader: "coffee-lint-loader?{...}"
}
```

- Adding an `coffeelint` entry in you webpack config for global options:

```js
module.exports = {
  coffeelint: {
    configFile: 'path/.coffeelint'
  }
}
```

**Note that you can use both method in order to benefit from global & specific options**

## Custom reporter

A reporter will provide as default. However, if you prefer a custom reporter, you can define a reporter in the options object.
The reporter function will be passed an array of violations generated by coffeelint. See [coffeelint api](http://www.coffeelint.org/#api).
The context of the reporter will be set to the same context as Webpack loaders. See [webpack loader context](http://webpack.github.io/docs/loaders.html#loader-context)

## Quiet Mode

You can choose to ignore warnings that are generated by coffeelint by defining a quiet boolean option in the options object.

## [License](LICENSE)
