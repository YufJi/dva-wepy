
import { create } from 'dva-core'
let app
let store
let dispatch

export default function createApp(opt) {
  app = create(opt)

  if (!global.registered) opt.models.forEach(model => app.model(model))
  global.registered = true
  app.start()

  store = app._store
  app.getStore = () => store

  dispatch = store.dispatch

  app.dispatch = dispatch
  return app
}
