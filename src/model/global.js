import { getData } from '../store/api'

export default {
  namespace: 'global',
  state: {
    list: [],
    loading: false
  },
  reducers: {
    setData(state, {payload}) {
      return { ...state, list: payload }
    },
    toggleLoading(state, { payload }) {
      return { ...state, loading: payload }
    },
  },
  effects: {
    * fetchData({ payload }, {call, put}) {
      yield put({
        type: 'toggleLoading',
        payload: true,
      })
      try {
        const data = yield call(getData, {})
        yield put({
          type: 'setData',
          payload: data,
        })
        yield put({
          type: 'toggleLoading',
          payload: false,
        })
      } catch (e) {
        console.log(e)
      }
    },
  },
}
