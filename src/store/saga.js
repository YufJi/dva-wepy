import { call, put, takeLatest } from 'redux-saga/effects'
import { getData } from './api'

function* fetchData({ payload }) {
  try {
    const data = yield call(getData, {})
    console.log(data)
  } catch (e) {
    console.log(e)
  }
}

export default function* rootSaga() {
  yield takeLatest('GETDATA', fetchData)
}
