import { $host, $authHost } from './index'

export const registerApi = async (username, password) => {
  const { data } = await $host.post('/api/users', {
    username, password
  })
  return data
}

export const getTokenApi = async (username, password) => {
  const { data } = await $host.post('/api/jwt/create', {
    username, password
  })
  return data
}

export const getUserApi = async () => {
  const { data } = await $authHost.get('/users/me')
  return data
}

export const updateUserApi = async (userData) => {
  if (userData instanceof FormData) {
    const { data } = await $authHost.patch('/users/me', userData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return data
  }

  const { data } = await $authHost.patch('/users/me', userData)
  return data
}

export const updateUserWithAvatar = async (userData) => {
  const formData = new FormData()

  // Добавляем поля пользователя
  if (userData.first_name !== undefined) formData.append('first_name', userData.first_name)
  if (userData.last_name !== undefined) formData.append('last_name', userData.last_name)
  if (userData.email !== undefined) formData.append('email', userData.email)

  // Добавляем поля профиля с префиксом profile.
  if (userData.profile?.phone !== undefined) formData.append('profile.phone', userData.profile.phone)

  if (userData.avatar) {
    formData.append('profile.avatar', userData.avatar)
  }

  console.log('FormData entries:')
  for (let pair of formData.entries()) {
    console.log(pair[0], pair[1])
  }

  return updateUserApi(formData)
}