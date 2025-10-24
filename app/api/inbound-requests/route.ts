import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/db'
import { InboundRequest } from '@/app/types/inbound'

// GET /api/inbound-requests - 모든 입고 요청 조회
export async function GET(request: NextRequest) {
  try {
    const requests = db.getAllInboundRequests()
    return NextResponse.json(
      {
        success: true,
        data: requests,
        count: requests.length
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching inbound requests:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch inbound requests'
      },
      { status: 500 }
    )
  }
}

// POST /api/inbound-requests - 새 입고 요청 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 필수 필드 검증
    if (!body.poNumber || !body.supplierName || !body.items || body.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: poNumber, supplierName, items'
        },
        { status: 400 }
      )
    }

    const newRequest: Omit<InboundRequest, 'id'> = {
      poNumber: body.poNumber,
      supplierName: body.supplierName,
      items: body.items,
      requestDate: body.requestDate || new Date().toISOString().split('T')[0],
      expectedDate: body.expectedDate || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      approvalStatus: '승인대기',
      memo: body.memo || ''
    }

    const created = db.createInboundRequest(newRequest)

    return NextResponse.json(
      {
        success: true,
        message: 'Inbound request created successfully',
        data: created
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating inbound request:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create inbound request'
      },
      { status: 500 }
    )
  }
}
