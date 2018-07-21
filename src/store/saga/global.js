import { effects } from 'redux-saga/dist/redux-saga'
import { getData } from '../api'

const { call, put, takeLatest } = effects

function* fetchData({ payload }) {
  yield put({
    type: 'TOGGLELOADING',
    payload: true,
  })
  try {
    const data = yield call(getData, {})
    yield put({
      type: 'SETDATA',
      payload: data,
    })
    yield put({
      type: 'TOGGLELOADING',
      payload: false,
    })
  } catch (e) {
    console.log(e)
  }
}

export default function* global() {
  yield takeLatest('GETDATA', fetchData)
}
