import { get } from '@/service/base'

export function getData(params) {
  return get({
    path: '/v1/vehicle/category.json',
    params,
  })
}
