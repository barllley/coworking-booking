import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

const $host = axios.create({
  baseURL: API_URL
})

const $authHost = axios.create({
  baseURL: API_URL
})

const authInterceptor = config => {
  config.headers.authorization = `Bearer ${localStorage.getItem('access')}`
  return config
}

$authHost.interceptors.request.use(authInterceptor)

$authHost.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry && localStorage.getItem('refresh')) {
      originalRequest._retry = true
      try {
        const { data } = await $host.post('/api/jwt/refresh/', {
          refresh: localStorage.getItem('refresh')
        })
        localStorage.setItem('access', data.access)
        originalRequest.headers.authorization = `Bearer ${data.access}`
        return $authHost(originalRequest)
      } catch (err) {
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export { $host, $authHost }