# react-image-zoom

[![Travis][build-badge]][build]
[![npm package][npm-badge]][npm]
[![Coveralls][coveralls-badge]][coveralls]

React image zoom makes transitioning from thumbnails to fullscreen images beautiful. It's the same effect you see on Medium.com.

## Install
```
yarn install react-image-zoom
```

[build-badge]: https://img.shields.io/travis/user/repo/master.png?style=flat-square
[build]: https://travis-ci.org/user/repo

[npm-badge]: https://img.shields.io/npm/v/npm-package.png?style=flat-square
[npm]: https://www.npmjs.org/package/npm-package

[coveralls-badge]: https://img.shields.io/coveralls/user/repo/master.png?style=flat-square
[coveralls]: https://coveralls.io/github/user/repo

```
import Zoom from 'react-image-zoom';

const SuperAwesomeImage = () => (
  <Zoom>
    <img src='/super-awesome-image.jpg' />
  </Zoom>
)
```