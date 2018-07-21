import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga/dist/redux-saga'
import rootReducer from './reducers'
import rootSaga from './saga'

const sagaMiddleware = createSagaMiddleware()
const initState = {
  global: {
    list: [],
    loading: true,
  },
}
const store = createStore(rootReducer, initState, applyMiddleware(sagaMiddleware))

rootSaga.forEach(saga => sagaMiddleware.run(saga))

export default store
