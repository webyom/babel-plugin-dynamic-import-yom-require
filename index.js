module.exports = function (opt) {
  var template = opt.template;
  var types = opt.types;

  var buildImport = template(
    [
      '(new Promise(function(resolve, reject) {',
      '  require([SOURCE], function(module) {',
      '    resolve(MODULE);',
      '  }, function(err) {',
      '    reject(err);',
      '  });',
      '}))'
    ].join('\n')
  );

  return {
    manipulateOptions: function (opts, parserOpts) {
      parserOpts.plugins.push('dynamicImport');
    },

    visitor: {
      Import: function (path) {
        var module = types.identifier('module');
        var MODULE
          = this.opts.noInterop === true
            ? module
            : types.callExpression(this.addHelper('interopRequireWildcard'), [
              module
            ]);
        var newImport = buildImport({
          SOURCE: path.parentPath.node.arguments,
          MODULE: MODULE
        });
        path.parentPath.replaceWith(newImport);
      }
    }
  };
};
