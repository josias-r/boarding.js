# [2.0.0](https://github.com/josias-r/boarding.js/compare/v1.2.3...v2.0.0) (2022-11-03)


### Bug Fixes

* rename `onHighlightStarted` to `onBeforeHighlighted` to make the naming more intuitive ([b619248](https://github.com/josias-r/boarding.js/commit/b61924837771f00159855b935e830fef8bbe87a2))


### BREAKING CHANGES

* you need to migrate all uses of onHighlightStarted to onBeforeHighlighted

## [1.2.3](https://github.com/josias-r/boarding.js/compare/v1.2.2...v1.2.3) (2022-11-03)


### Bug Fixes

* allow defining all HihglightedElement eventhandlers both on top-level or on step-level ([8ae590d](https://github.com/josias-r/boarding.js/commit/8ae590dadf2d9b969dbe63bd00ca60d430133b4d))

## [1.2.2](https://github.com/josias-r/boarding.js/compare/v1.2.1...v1.2.2) (2022-11-03)


### Bug Fixes

* optimze npm package files published ([72ff08a](https://github.com/josias-r/boarding.js/commit/72ff08a647e925749a8cea405e311c1fd8fa78a4))

## [1.2.1](https://github.com/josias-r/boarding.js/compare/v1.2.0...v1.2.1) (2022-11-03)


### Bug Fixes

* fix overlay opacity option being ignored ([597eac3](https://github.com/josias-r/boarding.js/commit/597eac3c8e08b1c84ae289b06698510bdeb8a863))
* set popover pointer-events to "auto", so it won't get overwritten by parent styles that might come from outside ([39f468c](https://github.com/josias-r/boarding.js/commit/39f468c99208164ddb2e52405a7ac252a287b073))

# [1.2.0](https://github.com/josias-r/boarding.js/compare/v1.1.3...v1.2.0) (2022-11-02)


### Features

* switch underlying highlighted-element tracking method. at the cost of a bit more performance usage, the element tracking is now much more stable (i.e. css transformations + animations are also tracked) ([d6f2fcc](https://github.com/josias-r/boarding.js/commit/d6f2fcc685c0dc5cbac3e27b713b0854aecb6e98))

## [1.1.3](https://github.com/josias-r/boarding.js/compare/v1.1.2...v1.1.3) (2022-11-02)


### Bug Fixes

* popover hide should actually unmount element not just hide it ([f5650e3](https://github.com/josias-r/boarding.js/commit/f5650e34ddaa9a1331b6328e82bf4fad488bec18))

## [1.1.2](https://github.com/josias-r/boarding.js/compare/v1.1.1...v1.1.2) (2022-11-02)


### Bug Fixes

* remove ResizeObserver and event listeners. Will be replaced by custom element tracking logic ([0fe479f](https://github.com/josias-r/boarding.js/commit/0fe479f2ba1e3671fa1a453e4599316bf7c86eb8))
* track active element on screen using requestAnimationFrame ([b32bbb7](https://github.com/josias-r/boarding.js/commit/b32bbb71ac44b3e01e62944f43e85c8fd53f4685))

## [1.1.1](https://github.com/josias-r/boarding.js/compare/v1.1.0...v1.1.1) (2022-11-02)


### Bug Fixes

* use ResizeObserver to watch for element size changes ([cbf835a](https://github.com/josias-r/boarding.js/commit/cbf835ac9bb3801a5825530612ace0a03d48ce4f))

# [1.1.0](https://github.com/josias-r/boarding.js/compare/v1.0.10...v1.1.0) (2022-11-01)


### Features

* highlight elements on the fly ([eda08ba](https://github.com/josias-r/boarding.js/commit/eda08ba45dd069f89d43e5b91eae67fe9d9cdbcb))

## [1.0.10](https://github.com/josias-r/boarding.js/compare/v1.0.9...v1.0.10) (2022-11-01)


### Bug Fixes

* allow defining a custom padding settings for each step if wanted ([7e940a6](https://github.com/josias-r/boarding.js/commit/7e940a63055b2d1927b8dccf1b7975b0170f2aee))

## [initial]


### Changes

* Release first usable iteration after refactoring driver.js.
