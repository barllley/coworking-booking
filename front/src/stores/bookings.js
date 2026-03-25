import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getBookings, createBooking, cancelBooking } from '@/api/bookings'

export const useBookingsStore = defineStore('bookings', () => {
  const bookings = ref([])
  const loading = ref(false)

  const fetchBookings = async () => {
    loading.value = true
    try {
      bookings.value = await getBookings()
    } catch (err) {
      console.error('Ошибка загрузки броней:', err)
    } finally {
      loading.value = false
    }
  }

  const addBooking = async (bookingData) => {
    loading.value = true
    try {
      const newBooking = await createBooking(bookingData)
      bookings.value.unshift(newBooking)
      return newBooking
    } catch (err) {
      console.error('Ошибка создания брони:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const cancelBookingById = async (id) => {
    loading.value = true
    try {
      await cancelBooking(id)
      const index = bookings.value.findIndex(b => b.id === id)
      if (index !== -1) {
        bookings.value[index].status = 'cancelled_by_user'
      }
    } catch (err) {
      console.error('Ошибка отмены брони:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const getBookingsByStatus = (status) => {
    return bookings.value.filter(b => b.status === status)
  }

  return {
    bookings,
    loading,
    fetchBookings,
    addBooking,
    cancelBookingById,
    getBookingsByStatus
  }
})