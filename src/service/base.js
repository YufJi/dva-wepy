import qs from 'qs'
import request from './request.js'
// 对get、post、delete、put四种方法做简单封装
// 后面所有的请求都是调用这几个方法

export function get({ path, params }) {
  const pStr = params ? `?${qs.stringify({...params, time: new Date().getTime()})}` : ''
  return request(`${path}${pStr}`, {
    method: 'GET',
    header: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }
  })
}

export function post({ path, params }) {
  return request(path, {
    method: 'POST',
    header: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    data: JSON.stringify(params)
  })
}

export function remove({ path, params }) {
  return request(path, {
    method: 'DELETE',
    header: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    data: JSON.stringify(params)
  })
}

export function put({ path, params }) {
  return request(path, {
    method: 'PUT',
    header: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    data: JSON.stringify(params)
  })
}
