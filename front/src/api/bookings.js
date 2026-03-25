import { $authHost } from './index'

export const getBookings = async () => {
  const { data } = await $authHost.get('/bookings')
  return data
}

export const createBooking = async (bookingData) => {
  const { data } = await $authHost.post('/bookings', bookingData)
  return data
}

export const updateBooking = async (id, bookingData) => {
  const { data } = await $authHost.patch(`/bookings/${id}`, bookingData)
  return data
}

export const cancelBooking = async (id) => {
  const { data } = await $authHost.patch(`/bookings/${id}`, {
    status: 'cancelled_by_user'
  })
  return data
}

export const markArrived = async (id) => {
  const { data } = await $authHost.post(`/bookings/${id}/mark_arrived`)
  return data
}

export const cancelByAdmin = async (id, reason) => {
  const { data } = await $authHost.post(`/bookings/${id}/cancel_by_admin`, {
    cancellation_reason: reason
  })
  return data
}