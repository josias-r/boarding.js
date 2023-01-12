## [3.3.1](https://github.com/josias-r/boarding.js/compare/v3.3.0...v3.3.1) (2023-01-12)


### Bug Fixes

* workaround for [#10](https://github.com/josias-r/boarding.js/issues/10) to fix weird cutout offset ([11072fe](https://github.com/josias-r/boarding.js/commit/11072fec93b3e0c458d00a8c964839d59c25d29e))

# [3.3.0](https://github.com/josias-r/boarding.js/compare/v3.2.1...v3.3.0) (2023-01-11)


### Features

* add onStart option that is called when `boarding.start` is called ([9f18187](https://github.com/josias-r/boarding.js/commit/9f18187cf5f528116240ba82d39ab7185c828797))
* pass a BoardingExitReason to onReset to allow for identifying what triggered the onReset ([05821bf](https://github.com/josias-r/boarding.js/commit/05821bf58d0d7536b7c804b91650b48dd45740d2))

## [3.2.1](https://github.com/josias-r/boarding.js/compare/v3.2.0...v3.2.1) (2023-01-04)


### Bug Fixes

* allow disabling scrollIntoView via "no-scroll" option (step-lvl and/or top-lvl) ([e78e2dc](https://github.com/josias-r/boarding.js/commit/e78e2dcb7eddd3a3e4e98815aa2c9cb9733ce38a))

# [3.2.0](https://github.com/josias-r/boarding.js/compare/v3.1.1...v3.2.0) (2022-11-24)


### Features

* introduce rounded corners for cutout (configurable) ([82bdfaa](https://github.com/josias-r/boarding.js/commit/82bdfaa64bae3b40172cfcc5b3a8d2afd95e970a))

## [3.1.1](https://github.com/josias-r/boarding.js/compare/v3.1.0...v3.1.1) (2022-11-24)


### Bug Fixes

* Release Next to Prod ([85577ef](https://github.com/josias-r/boarding.js/commit/85577ef30a7ffc17cd2f8ce155a2bc7d5b88c22b)), closes [#9](https://github.com/josias-r/boarding.js/issues/9)

# [3.1.0](https://github.com/josias-r/boarding.js/compare/v3.0.6...v3.1.0) (2022-11-24)


### Features

* allow disabling specific buttons ([81b7350](https://github.com/josias-r/boarding.js/commit/81b7350d46614e27066f1b3c5d0c84476506c60a))
* allow showing only a selection of buttons ([df11f15](https://github.com/josias-r/boarding.js/commit/df11f15dd99be665ef6e68a30019723ec26da7f9))

## [3.0.6](https://github.com/josias-r/boarding.js/compare/v3.0.5...v3.0.6) (2022-11-24)


### Bug Fixes

* add helper class to popover footer when it is hidden ([5050857](https://github.com/josias-r/boarding.js/commit/5050857ce53bea06d3a2b9dd074ee44d3ae8fbba))

## [3.0.5](https://github.com/josias-r/boarding.js/compare/v3.0.4...v3.0.5) (2022-11-14)


### Bug Fixes

* make currentStep public ([86314e7](https://github.com/josias-r/boarding.js/commit/86314e7f31f30da1e1194b36462d658fe0d25695))

## [3.0.4](https://github.com/josias-r/boarding.js/compare/v3.0.3...v3.0.4) (2022-11-11)


### Bug Fixes

* make currentStep public ([0d70bfc](https://github.com/josias-r/boarding.js/commit/0d70bfc83504d4afe2c0b68e5ba153fca1f8ce1e))

## [3.0.3](https://github.com/josias-r/boarding.js/compare/v3.0.2...v3.0.3) (2022-11-11)


### Bug Fixes

* fix step-level popover `showButtons` option being ignored when set to `false` ([5a921e0](https://github.com/josias-r/boarding.js/commit/5a921e092d71115653385acd595d97dfebe3c2af))
* improve "block-all" behaviour ([71ed0ba](https://github.com/josias-r/boarding.js/commit/71ed0ba2babac4967d8e0357c7d11c2ac3d86253))

## [3.0.2](https://github.com/josias-r/boarding.js/compare/v3.0.1...v3.0.2) (2022-11-07)


### Bug Fixes

* release next version to prod ([3cfd123](https://github.com/josias-r/boarding.js/commit/3cfd12358f0adb6587fedc96cc4fd0a78c504dc1))

## [3.0.1](https://github.com/josias-r/boarding.js/compare/v3.0.0...v3.0.1) (2022-11-07)


### Bug Fixes

* force the execution of `continue` to be async ([bba3db6](https://github.com/josias-r/boarding.js/commit/bba3db6d0aa8dcbad23c711c12dd2fcd4644a0d1))

# [3.0.0](https://github.com/josias-r/boarding.js/compare/v2.1.3...v3.0.0) (2022-11-07)


### Bug Fixes

* make `start` and `highlight` compatible with `prepareElement` ([46945d9](https://github.com/josias-r/boarding.js/commit/46945d98f803fd2859966b68eef8972048be52dc))


### Features

* add new `continue` API, which replaces `moveNext` and `movePrevious` ([e1f63a0](https://github.com/josias-r/boarding.js/commit/e1f63a01bb10221a13acb63ad7503a55aaeae34e))
* add new `prepareElement` optional step-lvl method that runs before mounting an element ([d9bf985](https://github.com/josias-r/boarding.js/commit/d9bf9851a8326718b7edd766ec271ad39e7a0a7f))


### BREAKING CHANGES

* You need to migrate from `moveNext/Previous` to new `continue` API. This API is much smarter and automatically moves into the direction where it was last prevented. If you want to programatically go to the next step, use the `next` method instead.

## [2.1.3](https://github.com/josias-r/boarding.js/compare/v2.1.2...v2.1.3) (2022-11-04)


### Bug Fixes

* make all click events even more isolated by using new `attachHighPrioClick` util method ([286fc40](https://github.com/josias-r/boarding.js/commit/286fc40980150b825a259bc83f30535d41e97dd0))
* make tip fully hidden when there is no side and alignment that can be found for it ([e859e04](https://github.com/josias-r/boarding.js/commit/e859e04e9dab1905f0ce17f53f68876184bef879))

## [2.1.2](https://github.com/josias-r/boarding.js/compare/v2.1.1...v2.1.2) (2022-11-04)


### Bug Fixes

* make clickevent even more isolated by listening on `document` during capture phase ([7c7bc74](https://github.com/josias-r/boarding.js/commit/7c7bc740ad8597a04687ac5ade1182b5ae5e9d3f))

## [2.1.1](https://github.com/josias-r/boarding.js/compare/v2.1.0...v2.1.1) (2022-11-04)


### Bug Fixes

* fix overlay css pointer-events logic for strictClickHandling not working properly ([41b6101](https://github.com/josias-r/boarding.js/commit/41b6101e0f5875bb54ccc13b57f1a07d956e35e4))
* make click handlers even more isolated by using `stopImmediatePropagation` and `useCapture` ([28be80e](https://github.com/josias-r/boarding.js/commit/28be80e6891dc393197a888e4be86f7fc6cc2a1d))

# [2.1.0](https://github.com/josias-r/boarding.js/compare/v2.0.0...v2.1.0) (2022-11-04)


### Bug Fixes

* add class to highlighted element, while it is highlighted ([e43307f](https://github.com/josias-r/boarding.js/commit/e43307f5379a2384dcda1d5d12a811cfa6b5b714))
* handle `strictClickHandling` visa CSS + pointer-events instead of complex/unstable JS ([8f86bbe](https://github.com/josias-r/boarding.js/commit/8f86bbed6255af557ff36d10eb4581b939403147))
* use specific clickhandler for overlay element to improve stability ([7be6bb8](https://github.com/josias-r/boarding.js/commit/7be6bb8887c38451bfaf5aaa43d41525a91a5c25))
* use specific clickhandler for popover elements to improve stability ([be26c00](https://github.com/josias-r/boarding.js/commit/be26c0056bb9adaddcdf0ea38e46545b91e1a2ed))


### Features

* add new `"block-all"` option for `strictClickHandling` ([377fcf5](https://github.com/josias-r/boarding.js/commit/377fcf5783217befe1bc734e2b8310e9793ccab1))

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
