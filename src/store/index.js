import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga/dist/redux-saga'
import rootReducer from './reducers'
import rootSaga from './saga'

const sagaMiddleware = createSagaMiddleware()

const store = createStore(rootReducer, initState, applyMiddleware(sagaMiddleware))

sagaMiddleware.run(rootSaga)

export default store

const initState = {
  global: {
    list: [],
    loading: false,
  },
}
