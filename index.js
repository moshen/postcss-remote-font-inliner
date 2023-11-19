const postcss = require('postcss');
const srcParser = require('css-font-face-src');
const remoteRegex = /^(https?:)?\/\//;

async function fetchAndTransformRemoteFont(_url) {
  let url = _url;
  if (url.indexOf('//') === 0) {
    url = 'http:' + url;
  }

  let res;
  let body;

  try {
    res = await fetch(url);

    if (res.status > 299) {
      let err = new Error('FONT_FETCH_FAILED');
      err.code = 'FONT_FETCH_FAILED';
      throw err;
    }

    body = Buffer.from(await res.arrayBuffer()).toString('base64');
  } catch (err) {
    let myErr = new Error('FONT_FETCH_FAILED');
    myErr.code = 'FONT_FETCH_FAILED';
    throw myErr;
  }

  return 'data:' + res.headers.get('content-type') + ';charset=utf-8;base64,' + body;
}

function getType(src) {
  return Object.keys(src).find(k => k === 'url' || k === 'local');
}

async function rewriteSrc(rule, srcs) {
  let foundRemote = false;
  let srcPromises = srcs.map(src => {
    let type = getType(src);
    if (type === 'url' && remoteRegex.test(src[type])) {
      foundRemote = true;
      return fetchAndTransformRemoteFont(src[type])
      .then(font => {
        src[type] = font;
      });
    }
  });

  if (foundRemote) {
    await Promise.all(srcPromises)

    let i = 0;
    rule.value = srcs.reduce((memo, src) => {
      let type = getType(src),
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
  }
}

const plugin = () => ({
  postcssPlugin: 'postcss-font-inliner',
  async Once(root) {
    let resPromises = [];

    root.walkAtRules('font-face', atRule =>
      atRule.walkDecls('src', rule => {
        resPromises.push(rewriteSrc(rule, srcParser.parse(rule.value)));
      })
    );

    return await Promise.all(resPromises);
  }
});
plugin.postcss = true;

module.exports = plugin;
