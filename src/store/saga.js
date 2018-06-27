import { effects } from 'redux-saga/dist/redux-saga'
import { getData } from './api'

const { call, takeLatest } = effects

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
