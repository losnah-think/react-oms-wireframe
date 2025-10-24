'use client'

import React from 'react'
import { useTranslation } from 'react-i18next'
import { ApprovalStatus } from '@/app/types/inbound'

interface ApprovalStatusTagProps {
  status: ApprovalStatus
}

const statusColors: Record<ApprovalStatus, { bg: string; text: string; border: string }> = {
  '승인대기': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-400' },
  '승인완료': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-400' },
  '반려됨': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-400' },
  '입고완료': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-400' },
}

export default function ApprovalStatusTag({ status }: ApprovalStatusTagProps) {
  const colors = statusColors[status]

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}
      style={{
        backgroundColor:
          status === '승인대기'
            ? '#C4C4C4'
            : status === '승인완료'
              ? '#4CAF50'
              : status === '반려됨'
                ? '#F44336'
                : '#2196F3',
        color: 'white',
      }}
    >
      {status}
    </span>
  )
}
