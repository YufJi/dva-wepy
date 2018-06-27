import { combineReducers } from 'redux'

function global(state = {}, action) {
  switch (action.type) {
    case 'GETDATA':
      return action.payload
    default:
      return state
  }
}

const rootReducer = combineReducers({
  global
})

export default rootReducer
