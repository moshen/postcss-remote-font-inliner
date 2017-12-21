const { promisify } = require('util'),
  postcss = require('postcss'),
  srcParser = require('css-font-face-src'),
  request = promisify(require('request')),
  remoteRegex = /^(https?:)?\/\//;

function fetchAndTransformRemoteFont(_url) {
  var url = _url;
  if (url.indexOf('//') === 0) {
    url = 'http:' + url;
  }

  return request({
    method: 'GET',
    url,
    encoding: null
  })
  .then(res => {
    if (res.statusCode > 299) {
      return Promise.reject(new Error('FONT_FETCH_FAILED'));
    }

    return 'data:' + res.headers['content-type'] + ';charset=utf-8;base64,' + res.body.toString('base64');
  });
}

function getType(src) {
  return Object.keys(src).find(k => k === 'url' || k === 'local');
}

function rewriteSrc(rule, srcs) {
  var foundRemote = false;
  var srcPromises = srcs.map(src => {
    var type = getType(src);
    if (type === 'url' && remoteRegex.test(src[type])) {
      foundRemote = true;
      return fetchAndTransformRemoteFont(src[type])
      .then(font => {
        src[type] = font;
      });
    }
  });

  if (foundRemote) {
    return Promise.all(srcPromises)
    .then(() => {
      var i = 0;
      rule.value = srcs.reduce((memo, src) => {
        var type = getType(src),
          ret = memo + (i > 0 ? ',' : '');
        if (type === 'local') {
          ret = ret + 'local("' + src[type].replace('"', '\\"') + '")';
        }

        if (type === 'url') {
          ret = ret + 'url("' + src[type].replace('"', '\\"') + '")';

          if (src.format) {
            ret = ret + ' format("' + src.format + '")';
          }
        }

        i++;
        return ret;
      }, '');
    });
  }
}

module.exports = postcss.plugin('postcss-font-inliner', function (opts) {
  opts = opts || {};

  return function (root, result) {
    return Promise.resolve()
    .then(() => {
      var resPromises = [];

      root.walkAtRules('font-face', atRule =>
        atRule.walkDecls('src', rule => {
          resPromises.push(rewriteSrc(rule, srcParser.parse(rule.value)));
        })
      );

      return Promise.all(resPromises);
    });
  };
});
