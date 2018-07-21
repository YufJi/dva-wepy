import wepy from 'wepy'
// 接口前缀
import { prefix } from '@/config.js'

function checkStatus(response) {
  if (response.statusCode >= 200 && response.statusCode < 300) return response

  const error = new Error(response.errMsg)
  error.response = response
  throw error
}

function valideData(obj) {
  const { data } = obj
  const { code, message, data: resData } = data
  if (Number(code) === 1) {
    return resData
  } else {
    throw message
  }
}
/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url, options) {
  return wepy.request({
    url: `${prefix}${url}`,
    ...options
  }).then(checkStatus)
    .then(valideData)
}
