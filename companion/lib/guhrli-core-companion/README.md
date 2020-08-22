# guhrli-companion

A library for fitbit companion apps to send CGM data to devices. Works in conjunction with the guhrli-app and gurhli-settings libraries.

## Getting started

First, copy the library into the `companion/` directory. Then inside `companion/index.js`:
```js
    import * as GuhrliCompanion from './lib/guhrli-core-companion'
    GuhrliCompanion.initialize()
```