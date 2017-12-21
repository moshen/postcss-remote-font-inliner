# PostCSS Remote Font Inliner

I had a very specific use case for base64 inlining hosted fonts (in my case
Google).  All this plugin does is look for `font-face` `src` declarations with
http(s) urls, downloads the fonts, base64 encodes them, and inlines them.

It works very well with [Font
Magician](https://github.com/jonathantneal/postcss-font-magician).

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
