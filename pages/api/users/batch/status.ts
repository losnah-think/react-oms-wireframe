// pages/api/users/batch/status.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userIds, status } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'Invalid user IDs' });
    }

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // Mock 응답
    res.json({
      success: true,
      message: `Successfully updated status for ${userIds.length} users`,
      updatedCount: userIds.length
    });
  } catch (error) {
    console.error('Batch status update error:', error);
    return res.status(500).json({ error: 'Failed to update status' });
  }
}
