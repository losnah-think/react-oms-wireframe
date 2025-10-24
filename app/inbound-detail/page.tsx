'use client'

import React, { useState } from 'react'
import Link from 'next/link'

interface TimelineStep {
  id: string
  label: string
  status: 'completed' | 'current' | 'pending'
}

export default function InboundRequestDetail() {
  const [showInvoice, setShowInvoice] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleString('ko-KR'))
  const [requestStatus, setRequestStatus] = useState<'pending' | 'approved' | 'zone_allocated' | 'zone_moved' | 'invoice_issued'>('pending')

  const timelineSteps: TimelineStep[] = [
    { id: 'requested', label: 'Requested', status: 'completed' },
    { id: 'approval_pending', label: 'Approval Pending', status: requestStatus === 'pending' ? 'current' : 'completed' },
    { id: 'approved', label: 'Approved', status: ['approved', 'zone_allocated', 'zone_moved', 'invoice_issued'].includes(requestStatus) ? 'completed' : 'pending' },
    { id: 'zone_allocated', label: 'Zone Allocated', status: ['zone_allocated', 'zone_moved', 'invoice_issued'].includes(requestStatus) ? 'completed' : 'pending' },
    { id: 'zone_moved', label: 'Zone Moved', status: ['zone_moved', 'invoice_issued'].includes(requestStatus) ? 'completed' : 'pending' },
    { id: 'invoice_issued', label: 'Invoice Issued', status: requestStatus === 'invoice_issued' ? 'completed' : 'pending' },
  ]

  const handleCheckStatus = async () => {
    try {
      // API: GET /api/inbound-status/{id}
      const mockResponse = {
        status: 'approved',
        updatedAt: new Date().toLocaleString('ko-KR'),
      }
      setRequestStatus('approved')
      setLastUpdated(mockResponse.updatedAt)
    } catch (error) {
      console.error('Failed to check status:', error)
    }
  }

  const handleCancelRequest = async () => {
    if (confirm('Are you sure you want to cancel this request?')) {
      try {
        // API: PATCH /api/inbound-status/{id}
        setRequestStatus('pending')
        alert('Request has been cancelled.')
      } catch (error) {
        console.error('Failed to cancel request:', error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-300 p-6">
        <h1 className="text-3xl font-bold text-gray-900">Inbound Request Detail</h1>
        <p className="text-sm text-gray-600 mt-1">View and manage inbound request details</p>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Summary Section */}
        <section className="border border-gray-300 p-6 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Summary Information</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-semibold text-gray-700">Request ID</p>
              <p className="text-base text-gray-900">INB-2024-001234</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">Request Date</p>
              <p className="text-base text-gray-900">2024-10-24 14:30:00</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">Shipper Name</p>
              <p className="text-base text-gray-900">ABC Supply Co., Ltd.</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">Warehouse Name</p>
              <p className="text-base text-gray-900">Seoul Distribution Center</p>
            </div>
          </div>
        </section>

        {/* Status Timeline */}
        <section className="border border-gray-300 p-6 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Status Timeline</h2>
          <p className="text-xs text-gray-500 mb-4">[API: PATCH /api/inbound-status - Updates workflow status]</p>
          
          <div className="flex items-center justify-between">
            {timelineSteps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center flex-1">
                {/* Step Circle */}
                <div
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm mb-2 ${
                    step.status === 'completed'
                      ? 'bg-gray-400 border-gray-400 text-white'
                      : step.status === 'current'
                      ? 'bg-white border-gray-900 text-gray-900'
                      : 'bg-white border-gray-300 text-gray-300'
                  }`}
                >
                  {step.status === 'completed' ? '✓' : index + 1}
                </div>
                {/* Step Label */}
                <p
                  className={`text-xs text-center font-semibold ${
                    step.status === 'completed'
                      ? 'text-gray-900'
                      : step.status === 'current'
                      ? 'text-gray-900 underline'
                      : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </p>
                {/* Connector Line */}
                {index < timelineSteps.length - 1 && (
                  <div
                    className={`w-full h-1 ${
                      step.status === 'completed' ? 'bg-gray-400' : 'bg-gray-300'
                    }`}
                    style={{ marginTop: '1rem', order: 1 }}
                  />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Item List Table */}
        <section className="border border-gray-300 p-6 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Item List</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-900">
                  <th className="text-left p-3 font-bold text-sm">Product Name</th>
                  <th className="text-left p-3 font-bold text-sm">SKU</th>
                  <th className="text-left p-3 font-bold text-sm">Quantity</th>
                  <th className="text-left p-3 font-bold text-sm">Unit</th>
                  <th className="text-left p-3 font-bold text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-300">
                  <td className="p-3 text-sm">Product A</td>
                  <td className="p-3 text-sm">SKU-001</td>
                  <td className="p-3 text-sm">100</td>
                  <td className="p-3 text-sm">EA</td>
                  <td className="p-3 text-sm">Received</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="p-3 text-sm">Product B</td>
                  <td className="p-3 text-sm">SKU-002</td>
                  <td className="p-3 text-sm">50</td>
                  <td className="p-3 text-sm">BOX</td>
                  <td className="p-3 text-sm">Pending</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="p-3 text-sm">Product C</td>
                  <td className="p-3 text-sm">SKU-003</td>
                  <td className="p-3 text-sm">200</td>
                  <td className="p-3 text-sm">EA</td>
                  <td className="p-3 text-sm">Received</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Action Area */}
        <section className="border border-gray-300 p-6 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Actions</h2>
          <div className="flex gap-4">
            <button
              onClick={handleCheckStatus}
              className="px-6 py-3 border-2 border-gray-900 text-gray-900 font-bold text-sm hover:bg-gray-100"
            >
              Check Status
            </button>
            <p className="text-xs text-gray-500 self-center">[API: GET /api/inbound-status/{'{id}'}]</p>
            
            {requestStatus === 'pending' && (
              <>
                <button
                  onClick={handleCancelRequest}
                  className="px-6 py-3 border-2 border-gray-700 text-gray-700 font-bold text-sm hover:bg-gray-100"
                >
                  Cancel Request
                </button>
                <p className="text-xs text-gray-500 self-center">[API: PATCH /api/inbound-status]</p>
              </>
            )}
          </div>
        </section>

        {/* Response Info */}
        <section className="border border-gray-300 p-6 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Response Information</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-700">Last Updated</p>
              <p className="text-base text-gray-900 font-mono">{lastUpdated}</p>
            </div>
            
            {(requestStatus === 'invoice_issued' || showInvoice) && (
              <div>
                <p className="text-sm font-semibold text-gray-700">Invoice Number</p>
                <p className="text-base text-gray-900 font-mono">INV-2024-005678</p>
              </div>
            )}
            
            {requestStatus !== 'pending' && !showInvoice && (
              <button
                onClick={() => setShowInvoice(true)}
                className="text-sm text-gray-700 underline font-semibold hover:text-gray-900"
              >
                Show Invoice (if issued)
              </button>
            )}
          </div>
        </section>

        {/* Notes Section */}
        <section className="border border-gray-300 p-6 bg-yellow-50">
          <p className="text-sm text-gray-700 font-semibold">Note:</p>
          <p className="text-xs text-gray-600 mt-2">
            This wireframe represents a simplified black-and-white prototype with no colors or icons. 
            All API call points are indicated with small text labels for integration reference.
          </p>
        </section>

        {/* Navigation */}
        <div className="flex gap-4 pt-6 border-t border-gray-300">
          <Link href="/" className="text-sm text-gray-700 font-semibold underline hover:text-gray-900">
            Back to Home
          </Link>
          <Link href="/inbound-list" className="text-sm text-gray-700 font-semibold underline hover:text-gray-900">
            View All Requests
          </Link>
        </div>
      </div>
    </div>
  )
}
