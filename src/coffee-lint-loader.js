const LoaderUtils       = require('loader-utils');
const StripJSONComments = require('strip-json-comments');
const FS                = require('fs');
const CoffeeLint        = require('coffeelint').lint;
const Chalk             = require('chalk');
const TextTable         = require('text-table');

function load_config(webpack, options, callback) {
  var path = options.configFile || './coffeelint.json';

  if (!path) { return callback(); }

  // Asynchronously.
  FS.exists(path, function(exists) {
    if (!exists) { return callback(); }

    // Let Webpack know about the config file.
    webpack.addDependency(path);

    // Read file and strip comments.
    FS.readFile(path, 'utf8', function(err, contents) {
      if (err) { return callback(err); }

      try {
        var config = StripJSONComments(contents);
        callback(null, JSON.parse(config));
      } catch (e) {
        callback(e);
      }
    });
  });
}

function extend(a, b) {
  for (var name in b) {
    a[name] = b[name];
  }

  return a;
}

function pluralize(word, count) {
  return (count === 1 ? word : word + 's');
}

function process(webpack, source, options) {
  var reporter = options.reporter;
  var quiet    = options.quiet;
  var data     = CoffeeLint(source, options);
  var warnings = 0;
  var errors   = 0;

  // Validation issues have occurred.
  if (data.length) {
    if (reporter) { return reporter(data); }

    var rows = [];

    // Build up an array of rows to be rendered in the table.
    data.forEach(function(issue) {
      var error   = (issue.level == 'error');
      var level   = error ? Chalk.red(issue.level) : Chalk.yellow(issue.level);
      var context = Chalk.white.bold(issue.context || issue.message);

      // If the quite option is set and it's a warning we ignore the issue.
      if (!quiet || error) {
        if (error) { errors++; } else { warnings++; }
        rows.push(['', Chalk.gray(issue.lineNumber), level, context, Chalk.gray(issue.rule)]);
      }
    });

    render_table(webpack, rows, warnings, errors);
  }
}

function render_table(webpack, rows, warnings, errors) {
  // issue color
  var color = errors ? 'red' : 'yellow';

  // file path.
  var path = Chalk.underline[color](webpack.resourcePath) + '\n';

  // build a formatted table of the lint issues. Very much inspired by Webpack's stylish formatter.
  var table = TextTable(rows, { align: ['', 'r', 'l', 'l'] }) + '\n';

  // build a summary to display
  var total = warnings + errors;
  var summary = [
    '\u2716 ', total, pluralize(' problem', total),
    ' (', errors, pluralize(' error', errors), ', ',
    warnings, pluralize(' warning', warnings), ')'
  ].join('');

  // build output line
  var output = ('\n' + path + table + '\n' + Chalk[color].bold(summary));
  var error = new Error(output);

  // render it
  if (errors) {
    webpack.emitError(error);
  } else {
    webpack.emitWarning(error);
  }
}

module.exports = function CoffeeLintLoader(source, map) {
  const webpack  = this;
  const callback = this.async();
  const options  = LoaderUtils.getOptions(this);

  this.cacheable && this.cacheable();

  load_config(webpack, options, function(err, config) {
    if (err) { return callback(err, null, null); }

    try {
      process(webpack, source, extend(options, config));
      callback(null, source, map);
    } catch (e) {
      callback(e, null, null);
    }
  });
}
