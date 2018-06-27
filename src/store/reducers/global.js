export default function global(state = {}, action) {
  const { global } = state
  switch (action.type) {
    case 'SETDATA':
      return { ...state, list: action.payload }
    case 'toggleLoading':
      return { ...state, loading: action.payload }
    default:
      return state
  }
}
