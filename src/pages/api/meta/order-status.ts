import type { NextApiRequest, NextApiResponse } from 'next'
import { mockOrderStatus, mockPaymentStatus, mockShippingStatus } from '../../../data/mockStatus'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({ orderStatusOptions: mockOrderStatus, paymentStatusOptions: mockPaymentStatus, shippingStatusOptions: mockShippingStatus })
}
