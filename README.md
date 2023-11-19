# PostCSS Remote Font Inliner

[![NPM](https://img.shields.io/npm/v/postcss-remote-font-inliner)](https://www.npmjs.com/package/postcss-remote-font-inliner)

## About

I had a very specific use case for base64 inlining hosted fonts (in my case
Google).  All this plugin does is look for `font-face` `src` declarations with
http(s) urls, downloads the fonts, base64 encodes them, and inlines them.

It works very well with [Font
Magician](https://github.com/jonathantneal/postcss-font-magician).

## Status

I consider this plugin complete. If there hasn't been a commit for awhile,
that's ok.  It's probably fine. I'll continue to upgrade it to keep up with it's
dependencies, and what's available in the Node standard library. If you have any
questions or concerns, please create an issue.

## Usage

Simply include it in your postcss pipeline:

```javascript
postcss([
   require('postcss-remote-font-inliner')()
]).process(
   fs.readFileSync('./css/src/style.css', 'utf8')
).then(function (result) {
   fs.writeFileSync('./css/style.css', result.css);
});
```

### Options

Currently, there are none.

## License

MIT
