import { $host, $authHost } from './index'

export const getResources = async (params = {}) => {
  const { data } = await $host.get('/resources', { params })
  return data
}

export const getResource = async (id) => {
  const { data } = await $host.get(`/resources/${id}`)
  return data
}

export const createResource = async (resourceData) => {
  const { data } = await $authHost.post('/resources', resourceData)
  return data
}

export const updateResource = async (id, resourceData) => {
  const { data } = await $authHost.patch(`/resources/${id}`, resourceData)
  return data
}

export const deleteResource = async (id) => {
  await $authHost.delete(`/resources/${id}`)
}