import axios from 'axios'
import { InboundStatusResponse, InboundRequest } from '@/app/types/inbound'

// API 기본 URL - 클라이언트 사이드에서 자동으로 현재 도메인 사용
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // 클라이언트 사이드
    return `${window.location.origin}/api`
  }
  // 서버 사이드
  return process.env.NEXT_PUBLIC_API_BASE_URL || '/api'
}

export const inboundAPI = {
  // 입고 상태 조회
  getInboundStatus: async (id: string): Promise<any> => {
    try {
      const baseUrl = getApiBaseUrl()
      const response = await axios.get(`${baseUrl}/inbound-status/${id}`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch inbound status:', error)
      throw error
    }
  },

  // 입고 요청 제출
  submitInboundRequest: async (data: Omit<InboundRequest, 'id'>) => {
    try {
      const baseUrl = getApiBaseUrl()
      const response = await axios.post(`${baseUrl}/inbound-requests`, data)
      return response.data
    } catch (error) {
      console.error('Failed to submit inbound request:', error)
      throw error
    }
  },

  // 입고 요청 목록 조회
  getInboundRequests: async (): Promise<any> => {
    try {
      const baseUrl = getApiBaseUrl()
      const response = await axios.get(`${baseUrl}/inbound-requests`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch inbound requests:', error)
      throw error
    }
  },

  // 입고 상태 업데이트 (승인/반려)
  updateInboundStatus: async (id: string, status: string, reason?: string): Promise<any> => {
    try {
      const baseUrl = getApiBaseUrl()
      const response = await axios.patch(`${baseUrl}/inbound-status/${id}`, {
        status,
        reason
      })
      return response.data
    } catch (error) {
      console.error('Failed to update inbound status:', error)
      throw error
    }
  },

  // 입고 요청 삭제
  deleteInboundRequest: async (id: string): Promise<any> => {
    try {
      const baseUrl = getApiBaseUrl()
      const response = await axios.delete(`${baseUrl}/inbound-status/${id}`)
      return response.data
    } catch (error) {
      console.error('Failed to delete inbound request:', error)
      throw error
    }
  }
}
