import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/db'

// GET /api/inbound-status/[id] - 특정 입고 요청의 상태 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing request ID'
        },
        { status: 400 }
      )
    }

    const inboundRequest = db.getInboundRequestById(id)

    if (!inboundRequest) {
      return NextResponse.json(
        {
          success: false,
          error: 'Inbound request not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: inboundRequest.id,
          status: inboundRequest.approvalStatus,
          updatedAt: new Date().toISOString(),
          reason: inboundRequest.memo,
          requestDetails: inboundRequest
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching inbound status:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch inbound status'
      },
      { status: 500 }
    )
  }
}

// PATCH /api/inbound-status/[id] - 입고 요청 상태 업데이트
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing request ID'
        },
        { status: 400 }
      )
    }

    if (!body.status) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing status field'
        },
        { status: 400 }
      )
    }

    const validStatuses = ['승인대기', '승인완료', '반려됨', '입고완료']
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid status. Valid values: 승인대기, 승인완료, 반려됨, 입고완료'
        },
        { status: 400 }
      )
    }

    const updated = db.updateInboundStatus(id, body.status, body.reason)

    if (!updated) {
      return NextResponse.json(
        {
          success: false,
          error: 'Inbound request not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Status updated successfully',
        data: {
          id: updated.id,
          status: updated.approvalStatus,
          updatedAt: new Date().toISOString(),
          reason: updated.memo
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating inbound status:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update inbound status'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/inbound-status/[id] - 입고 요청 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing request ID'
        },
        { status: 400 }
      )
    }

    const deleted = db.deleteInboundRequest(id)

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: 'Inbound request not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Inbound request deleted successfully'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting inbound request:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete inbound request'
      },
      { status: 500 }
    )
  }
}
