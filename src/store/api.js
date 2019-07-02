import { get } from '@/service/base'

export function getData(params) {
  return get({
    path: '/sk/%E6%89%8B%E6%9C%BA',
    params,
  })
}
