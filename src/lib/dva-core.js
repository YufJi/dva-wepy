(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('warning'), require('redux'), require('flatten'), require('global/window'), require('redux-saga/lib/effects'), require('redux-saga/lib/internal/sagaHelpers'), require('redux-saga/lib/internal/middleware'))
  : typeof define === 'function' && define.amd ? define(['exports', 'warning', 'redux', 'flatten', 'global/window', 'redux-saga/lib/effects', 'redux-saga/lib/internal/sagaHelpers', 'redux-saga/lib/internal/middleware'], factory)
  : (factory((global.dva = global.dva || {}, global.dva.core = {}), global.warning, global.redux, global.flatten, global.window, global.sagaEffects, global.sagaHelpers, global.createSagaMiddleware))
}(this, function (exports, warning, redux, flatten, window, sagaEffects, sagaHelpers, createSagaMiddleware) {
  'use strict'

  warning = warning && warning.hasOwnProperty('default') ? warning['default'] : warning
  flatten = flatten && flatten.hasOwnProperty('default') ? flatten['default'] : flatten
  window = window && window.hasOwnProperty('default') ? window['default'] : window
  createSagaMiddleware = createSagaMiddleware && createSagaMiddleware.hasOwnProperty('default') ? createSagaMiddleware['default'] : createSagaMiddleware

  /**
   * Copyright (c) 2013-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */

  /**
   * Use invariant() to assert state which your program assumes to be true.
   *
   * Provide sprintf-style format (only %s is supported) and arguments
   * to provide information about what broke and what you were
   * expecting.
   *
   * The invariant message will be stripped in production, but the invariant
   * will remain to ensure logic does not differ in production.
   */

  var NODE_ENV

  var invariant = function(condition, format, a, b, c, d, e, f) {
    if (NODE_ENV !== 'production') {
      if (format === undefined) {
        throw new Error('invariant requires an error message argument')
      }
    }

    if (!condition) {
      var error
      if (format === undefined) {
        error = new Error(
          'Minified exception occurred; use the non-minified dev environment ' +
          'for the full error message and additional helpful warnings.'
        )
      } else {
        var args = [a, b, c, d, e, f]
        var argIndex = 0
        error = new Error(
          format.replace(/%s/g, function() { return args[argIndex++] })
        )
        error.name = 'Invariant Violation'
      }

      error.framesToPop = 1 // we don't care about invariant's own frame
      throw error
    }
  }

  var invariant_1 = invariant

  /*!
   * isobject <https://github.com/jonschlinkert/isobject>
   *
   * Copyright (c) 2014-2017, Jon Schlinkert.
   * Released under the MIT License.
   */

  var isobject = function isObject(val) {
    return val != null && typeof val === 'object' && Array.isArray(val) === false
  }

  function isObjectObject(o) {
    return isobject(o) === true &&
      Object.prototype.toString.call(o) === '[object Object]'
  }

  var isPlainObject = function isPlainObject(o) {
    var ctor, prot

    if (isObjectObject(o) === false) return false

    // If has modified constructor
    ctor = o.constructor
    if (typeof ctor !== 'function') return false

    // If has modified prototype
    prot = ctor.prototype
    if (isObjectObject(prot) === false) return false

    // If constructor does not have an Object-specific method
    if (prot.hasOwnProperty('isPrototypeOf') === false) {
      return false
    }

    // Most likely a plain Object
    return true
  }

  const isPlainObject$1 = isPlainObject
  const isArray = Array.isArray.bind(Array)
  const isFunction = o => typeof o === 'function'
  const returnSelf = m => m
  // avoid es6 array.prototype.findIndex polyfill
  const noop = () => {}
  const findIndex = (array, predicate) => {
    for (let i = 0, length = array.length; i < length; i++) {
      if (predicate(array[i], i)) return i
    }

    return -1
  }

  function checkModel(model, existModels) {
    const {
      namespace,
      reducers,
      effects,
      subscriptions,
    } = model

    // namespace 必须被定义
    invariant_1(
      namespace,
      `[app.model] namespace should be defined`,
    )
    // 并且是字符串
    invariant_1(
      typeof namespace === 'string',
      `[app.model] namespace should be string, but got ${typeof namespace}`,
    )
    // 并且唯一
    invariant_1(
      !existModels.some(model => model.namespace === namespace),
      `[app.model] namespace should be unique`,
    )

    // state 可以为任意值

    // reducers 可以为空，PlainObject 或者数组
    if (reducers) {
      invariant_1(
        isPlainObject$1(reducers) || isArray(reducers),
        `[app.model] reducers should be plain object or array, but got ${typeof reducers}`,
      )
      // 数组的 reducers 必须是 [Object, Function] 的格式
      invariant_1(
        !isArray(reducers) || (isPlainObject$1(reducers[0]) && isFunction(reducers[1])),
        `[app.model] reducers with array should be [Object, Function]`,
      )
    }

    // effects 可以为空，PlainObject
    if (effects) {
      invariant_1(
        isPlainObject$1(effects),
        `[app.model] effects should be plain object, but got ${typeof effects}`,
      )
    }

    if (subscriptions) {
      // subscriptions 可以为空，PlainObject
      invariant_1(
        isPlainObject$1(subscriptions),
        `[app.model] subscriptions should be plain object, but got ${typeof subscriptions}`,
      )

      // subscription 必须为函数
      invariant_1(
        isAllFunction(subscriptions),
        `[app.model] subscription should be function`,
      )
    }
  }

  function isAllFunction(obj) {
    return Object.keys(obj).every(key => isFunction(obj[key]))
  }

  const NAMESPACE_SEP = '/'

  function prefix(obj, namespace, type) {
    return Object.keys(obj).reduce((memo, key) => {
      warning(
        key.indexOf(`${namespace}${NAMESPACE_SEP}`) !== 0,
        `[prefixNamespace]: ${type} ${key} should not be prefixed with namespace ${namespace}`,
      )
      const newKey = `${namespace}${NAMESPACE_SEP}${key}`
      memo[newKey] = obj[key]
      return memo
    }, {})
  }

  function prefixNamespace(model) {
    const {
      namespace,
      reducers,
      effects,
    } = model

    if (reducers) {
      if (isArray(reducers)) {
        model.reducers[0] = prefix(reducers[0], namespace, 'reducer')
      } else {
        model.reducers = prefix(reducers, namespace, 'reducer')
      }
    }
    if (effects) {
      model.effects = prefix(effects, namespace, 'effect')
    }
    return model
  }

  const hooks = [
    'onError',
    'onStateChange',
    'onAction',
    'onHmr',
    'onReducer',
    'onEffect',
    'extraReducers',
    'extraEnhancers',
    '_handleActions',
  ]

  function filterHooks(obj) {
    return Object.keys(obj).reduce((memo, key) => {
      if (hooks.indexOf(key) > -1) {
        memo[key] = obj[key]
      }
      return memo
    }, {})
  }

  class Plugin {
    constructor() {
      this._handleActions = null
      this.hooks = hooks.reduce((memo, key) => {
        memo[key] = []
        return memo
      }, {})
    }

    use(plugin) {
      invariant_1(
        isPlainObject$1(plugin),
        'plugin.use: plugin should be plain object'
      )
      const hooks = this.hooks
      for (const key in plugin) {
        if (Object.prototype.hasOwnProperty.call(plugin, key)) {
          invariant_1(hooks[key], `plugin.use: unknown plugin property: ${key}`)
          if (key === '_handleActions') {
            this._handleActions = plugin[key]
          } else if (key === 'extraEnhancers') {
            hooks[key] = plugin[key]
          } else {
            hooks[key].push(plugin[key])
          }
        }
      }
    }

    apply(key, defaultHandler) {
      const hooks = this.hooks
      const validApplyHooks = ['onError', 'onHmr']
      invariant_1(
        validApplyHooks.indexOf(key) > -1,
        `plugin.apply: hook ${key} cannot be applied`
      )
      const fns = hooks[key]

      return (...args) => {
        if (fns.length) {
          for (const fn of fns) {
            fn(...args)
          }
        } else if (defaultHandler) {
          defaultHandler(...args)
        }
      }
    }

    get(key) {
      const hooks = this.hooks
      invariant_1(key in hooks, `plugin.get: hook ${key} cannot be got`)
      if (key === 'extraReducers') {
        return getExtraReducers(hooks[key])
      } else if (key === 'onReducer') {
        return getOnReducer(hooks[key])
      } else {
        return hooks[key]
      }
    }
  }

  function getExtraReducers(hook) {
    let ret = {}
    for (const reducerObj of hook) {
      ret = { ...ret, ...reducerObj }
    }
    return ret
  }

  function getOnReducer(hook) {
    return function(reducer) {
      for (const reducerEnhancer of hook) {
        reducer = reducerEnhancer(reducer)
      }
      return reducer
    }
  }

  function createStore({
    reducers,
    initialState,
    plugin,
    sagaMiddleware,
    promiseMiddleware,
    createOpts: { setupMiddlewares = returnSelf },
  }) {
    // extra enhancers
    const extraEnhancers = plugin.get('extraEnhancers')
    invariant_1(
      isArray(extraEnhancers),
      `[app.start] extraEnhancers should be array, but got ${typeof extraEnhancers}`
    )

    const extraMiddlewares = plugin.get('onAction')
    const middlewares = setupMiddlewares([
      promiseMiddleware,
      sagaMiddleware,
      ...flatten(extraMiddlewares),
    ])

    let devtools = () => noop$$1 => noop$$1
    if (
      undefined !== 'production' &&
      window.__REDUX_DEVTOOLS_EXTENSION__
    ) {
      devtools = window.__REDUX_DEVTOOLS_EXTENSION__
    }

    const enhancers = [
      redux.applyMiddleware(...middlewares),
      ...extraEnhancers,
      devtools(window.__REDUX_DEVTOOLS_EXTENSION__OPTIONS),
    ]

    return redux.createStore(reducers, initialState, redux.compose(...enhancers))
  }

  function prefixType(type, model) {
    const prefixedType = `${model.namespace}${NAMESPACE_SEP}${type}`
    const typeWithoutAffix = prefixedType.replace(/\/@@[^/]+?$/, '')
    if ((model.reducers && model.reducers[typeWithoutAffix]) ||
      (model.effects && model.effects[typeWithoutAffix])) {
      return prefixedType
    }
    return type
  }

  function getSaga(effects, model, onError, onEffect) {
    return function*() {
      for (const key in effects) {
        if (Object.prototype.hasOwnProperty.call(effects, key)) {
          const watcher = getWatcher(key, effects[key], model, onError, onEffect)
          const task = yield sagaEffects.fork(watcher)
          yield sagaEffects.fork(function*() {
            yield sagaEffects.take(`${model.namespace}/@@CANCEL_EFFECTS`)
            yield sagaEffects.cancel(task)
          })
        }
      }
    }
  }

  function getWatcher(key, _effect, model, onError, onEffect) {
    let effect = _effect
    let type = 'takeEvery'
    let ms

    if (Array.isArray(_effect)) {
      effect = _effect[0]
      const opts = _effect[1]
      if (opts && opts.type) {
        type = opts.type
        if (type === 'throttle') {
          invariant_1(
            opts.ms,
            'app.start: opts.ms should be defined if type is throttle'
          )
          ms = opts.ms
        }
      }
      invariant_1(
        ['watcher', 'takeEvery', 'takeLatest', 'throttle'].indexOf(type) > -1,
        'app.start: effect type should be takeEvery, takeLatest, throttle or watcher'
      )
    }

    function noop() {}

    function* sagaWithCatch(...args) {
      const { __dva_resolve: resolve = noop, __dva_reject: reject = noop } =
        args.length > 0 ? args[0] : {}
      try {
        yield sagaEffects.put({ type: `${key}${NAMESPACE_SEP}@@start` })
        const ret = yield effect(...args.concat(createEffects(model)))
        yield sagaEffects.put({ type: `${key}${NAMESPACE_SEP}@@end` })
        resolve(ret)
      } catch (e) {
        onError(e, {
          key,
          effectArgs: args,
        })
        if (!e._dontReject) {
          reject(e)
        }
      }
    }

    const sagaWithOnEffect = applyOnEffect(onEffect, sagaWithCatch, model, key)

    switch (type) {
      case 'watcher':
        return sagaWithCatch
      case 'takeLatest':
        return function*() {
          yield sagaHelpers.takeLatestHelper(key, sagaWithOnEffect)
        }
      case 'throttle':
        return function*() {
          yield sagaHelpers.throttleHelper(ms, key, sagaWithOnEffect)
        }
      default:
        return function*() {
          yield sagaHelpers.takeEveryHelper(key, sagaWithOnEffect)
        }
    }
  }

  function createEffects(model) {
    function assertAction(type, name) {
      invariant_1(type, 'dispatch: action should be a plain Object with type')
      warning(
        type.indexOf(`${model.namespace}${NAMESPACE_SEP}`) !== 0,
        `[${name}] ${type} should not be prefixed with namespace ${
        model.namespace
      }`
      )
    }
    function put(action) {
      const { type } = action
      assertAction(type, 'sagaEffects.put')
      return sagaEffects.put({ ...action, type: prefixType(type, model) })
    }

    // The operator `put` doesn't block waiting the returned promise to resolve.
    // Using `put.resolve` will wait until the promsie resolve/reject before resuming.
    // It will be helpful to organize multi-effects in order,
    // and increase the reusability by seperate the effect in stand-alone pieces.
    // https://github.com/redux-saga/redux-saga/issues/336
    function putResolve(action) {
      const { type } = action
      assertAction(type, 'sagaEffects.put.resolve')
      return sagaEffects.put.resolve({
        ...action,
        type: prefixType(type, model),
      })
    }
    put.resolve = putResolve

    function take(type) {
      if (typeof type === 'string') {
        assertAction(type, 'sagaEffects.take')
        return sagaEffects.take(prefixType(type, model))
      } else if (Array.isArray(type)) {
        return sagaEffects.take(
          type.map(t => {
            if (typeof t === 'string') {
              assertAction(t, 'sagaEffects.take')
              return prefixType(t, model)
            }
            return t
          })
        )
      } else {
        return sagaEffects.take(type)
      }
    }
    return { ...sagaEffects, put, take }
  }

  function applyOnEffect(fns, effect, model, key) {
    for (const fn of fns) {
      effect = fn(effect, sagaEffects, model, key)
    }
    return effect
  }

  function identify(value) {
    return value
  }

  function handleAction(actionType, reducer = identify) {
    return (state, action) => {
      const { type } = action
      invariant_1(type, 'dispatch: action should be a plain Object with type')
      if (actionType === type) {
        return reducer(state, action)
      }
      return state
    }
  }

  function reduceReducers(...reducers) {
    return (previous, current) =>
      reducers.reduce((p, r) => r(p, current), previous)
  }

  function handleActions(handlers, defaultState) {
    const reducers = Object.keys(handlers).map(type =>
      handleAction(type, handlers[type])
    )
    const reducer = reduceReducers(...reducers)
    return (state = defaultState, action) => reducer(state, action)
  }

  function getReducer(reducers, state, handleActions$$1) {
    // Support reducer enhancer
    // e.g. reducers: [realReducers, enhancer]
    if (Array.isArray(reducers)) {
      return reducers[1](
        (handleActions$$1 || handleActions)(reducers[0], state)
      )
    } else {
      return (handleActions$$1 || handleActions)(reducers || {}, state)
    }
  }

  function createPromiseMiddleware(app) {
    return () => next => action => {
      const { type } = action
      if (isEffect(type)) {
        return new Promise((resolve, reject) => {
          next({
            __dva_resolve: resolve,
            __dva_reject: reject,
            ...action,
          })
        })
      } else {
        return next(action)
      }
    }

    function isEffect(type) {
      if (!type || typeof type !== 'string') return false
      const [namespace] = type.split(NAMESPACE_SEP)
      const model = app._models.filter(m => m.namespace === namespace)[0]
      if (model) {
        if (model.effects && model.effects[type]) {
          return true
        }
      }

      return false
    }
  }

  function prefixedDispatch(dispatch, model) {
    return (action) => {
      const { type } = action
      invariant_1(type, 'dispatch: action should be a plain Object with type')
      warning(
        type.indexOf(`${model.namespace}${NAMESPACE_SEP}`) !== 0,
        `dispatch: ${type} should not be prefixed with namespace ${model.namespace}`,
      )
      return dispatch({ ...action, type: prefixType(type, model) })
    }
  }

  function run(subs, model, app, onError) {
    const funcs = []
    const nonFuncs = []
    for (const key in subs) {
      if (Object.prototype.hasOwnProperty.call(subs, key)) {
        const sub = subs[key]
        const unlistener = sub({
          dispatch: prefixedDispatch(app._store.dispatch, model),
          history: app._history,
        }, onError)
        if (isFunction(unlistener)) {
          funcs.push(unlistener)
        } else {
          nonFuncs.push(key)
        }
      }
    }
    return { funcs, nonFuncs }
  }

  function unlisten(unlisteners, namespace) {
    if (!unlisteners[namespace]) return

    const { funcs, nonFuncs } = unlisteners[namespace]
    warning(
      nonFuncs.length === 0,
      `[app.unmodel] subscription should return unlistener function, check these subscriptions ${nonFuncs.join(', ')}`,
    )
    for (const unlistener of funcs) {
      unlistener()
    }
    delete unlisteners[namespace]
  }

  // Internal model to update global state when do unmodel
  const dvaModel = {
    namespace: '@@dva',
    state: 0,
    reducers: {
      UPDATE(state) {
        return state + 1
      },
    },
  }

  /**
   * Create dva-core instance.
   *
   * @param hooksAndOpts
   * @param createOpts
   */
  function create(hooksAndOpts = {}, createOpts = {}) {
    const { initialReducer, setupApp = noop } = createOpts

    const plugin = new Plugin()
    plugin.use(filterHooks(hooksAndOpts))

    const app = {
      _models: [prefixNamespace({ ...dvaModel })],
      _store: null,
      _plugin: plugin,
      use: plugin.use.bind(plugin),
      model,
      start,
    }
    return app

    /**
     * Register model before app is started.
     *
     * @param m {Object} model to register
     */
    function model(m) {
      if (undefined !== 'production') {
        checkModel(m, app._models)
      }
      const prefixedModel = prefixNamespace({ ...m })
      app._models.push(prefixedModel)
      return prefixedModel
    }

    /**
     * Inject model after app is started.
     *
     * @param createReducer
     * @param onError
     * @param unlisteners
     * @param m
     */
    function injectModel(createReducer, onError, unlisteners, m) {
      m = model(m)

      const store = app._store
      store.asyncReducers[m.namespace] = getReducer(
        m.reducers,
        m.state,
        plugin._handleActions
      )
      store.replaceReducer(createReducer())
      if (m.effects) {
        store.runSaga(
          app._getSaga(m.effects, m, onError, plugin.get('onEffect'))
        )
      }
      if (m.subscriptions) {
        unlisteners[m.namespace] = run(
          m.subscriptions,
          m,
          app,
          onError
        )
      }
    }

    /**
     * Unregister model.
     *
     * @param createReducer
     * @param reducers
     * @param unlisteners
     * @param namespace
     *
     * Unexpected key warn problem:
     * https://github.com/reactjs/redux/issues/1636
     */
    function unmodel(createReducer, reducers, unlisteners, namespace) {
      const store = app._store

      // Delete reducers
      delete store.asyncReducers[namespace]
      delete reducers[namespace]
      store.replaceReducer(createReducer())
      store.dispatch({ type: '@@dva/UPDATE' })

      // Cancel effects
      store.dispatch({ type: `${namespace}/@@CANCEL_EFFECTS` })

      // Unlisten subscrioptions
      unlisten(unlisteners, namespace)

      // Delete model from app._models
      app._models = app._models.filter(model => model.namespace !== namespace)
    }

    /**
     * Replace a model if it exsits, if not, add it to app
     * Attention:
     * - Only available after dva.start gets called
     * - Will not check origin m is strict equal to the new one
     * Useful for HMR
     * @param createReducer
     * @param reducers
     * @param unlisteners
     * @param onError
     * @param m
     */
    function replaceModel(createReducer, reducers, unlisteners, onError, m) {
      const store = app._store
      const { namespace } = m
      const oldModelIdx = findIndex(
        app._models,
        model => model.namespace === namespace
      )

      if (~oldModelIdx) {
        // Cancel effects
        store.dispatch({ type: `${namespace}/@@CANCEL_EFFECTS` })

        // Delete reducers
        delete store.asyncReducers[namespace]
        delete reducers[namespace]

        // Unlisten subscrioptions
        unlisten(unlisteners, namespace)

        // Delete model from app._models
        app._models.splice(oldModelIdx, 1)
      }

      // add new version model to store
      app.model(m)

      store.dispatch({ type: '@@dva/UPDATE' })
    }

    /**
     * Start the app.
     *
     * @returns void
     */
    function start() {
      // Global error handler
      const onError = (err, extension) => {
        if (err) {
          if (typeof err === 'string') err = new Error(err)
          err.preventDefault = () => {
            err._dontReject = true
          }
          plugin.apply('onError', err => {
            throw new Error(err.stack || err)
          })(err, app._store.dispatch, extension)
        }
      }

      const sagaMiddleware = createSagaMiddleware()
      const promiseMiddleware = createPromiseMiddleware(app)
      app._getSaga = getSaga.bind(null)

      const sagas = []
      const reducers = { ...initialReducer }
      for (const m of app._models) {
        reducers[m.namespace] = getReducer(
          m.reducers,
          m.state,
          plugin._handleActions
        )
        if (m.effects) { sagas.push(app._getSaga(m.effects, m, onError, plugin.get('onEffect'))) }
      }
      const reducerEnhancer = plugin.get('onReducer')
      const extraReducers = plugin.get('extraReducers')
      invariant_1(
        Object.keys(extraReducers).every(key => !(key in reducers)),
        `[app.start] extraReducers is conflict with other reducers, reducers list: ${Object.keys(
        reducers
      ).join(', ')}`
      )

      // Create store
      const store = (app._store = createStore({
        // eslint-disable-line
        reducers: createReducer(),
        initialState: hooksAndOpts.initialState || {},
        plugin,
        createOpts,
        sagaMiddleware,
        promiseMiddleware,
      }))

      // Extend store
      store.runSaga = sagaMiddleware.run
      store.asyncReducers = {}

      // Execute listeners when state is changed
      const listeners = plugin.get('onStateChange')
      for (const listener of listeners) {
        store.subscribe(() => {
          listener(store.getState())
        })
      }

      // Run sagas
      sagas.forEach(sagaMiddleware.run)

      // Setup app
      setupApp(app)

      // Run subscriptions
      const unlisteners = {}
      for (const model of this._models) {
        if (model.subscriptions) {
          unlisteners[model.namespace] = run(
            model.subscriptions,
            model,
            app,
            onError
          )
        }
      }

      // Setup app.model and app.unmodel
      app.model = injectModel.bind(app, createReducer, onError, unlisteners)
      app.unmodel = unmodel.bind(app, createReducer, reducers, unlisteners)
      app.replaceModel = replaceModel.bind(
        app,
        createReducer,
        reducers,
        unlisteners,
        onError
      )

      /**
       * Create global reducer for redux.
       *
       * @returns {Object}
       */
      function createReducer() {
        return reducerEnhancer(
          redux.combineReducers({
            ...reducers,
            ...extraReducers,
            ...(app._store ? app._store.asyncReducers : {}),
          })
        )
      }
    }
  }

  exports.create = create

  Object.defineProperty(exports, '__esModule', { value: true })
}))
