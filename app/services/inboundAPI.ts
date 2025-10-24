import axios from 'axios'
import { InboundStatusResponse } from '@/app/types/inbound'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api'

export const inboundAPI = {
  // 입고 상태 조회
  getInboundStatus: async (id: string): Promise<InboundStatusResponse> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/inbound-status/${id}`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch inbound status:', error)
      throw error
    }
  },

  // 입고 요청 제출
  submitInboundRequest: async (data: any) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/inbound-requests`, data)
      return response.data
    } catch (error) {
      console.error('Failed to submit inbound request:', error)
      throw error
    }
  },

  // 입고 요청 목록 조회
  getInboundRequests: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/inbound-requests`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch inbound requests:', error)
      throw error
    }
  },
}
