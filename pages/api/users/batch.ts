// pages/api/users/batch.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userIds, action } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'Invalid user IDs' });
    }

    if (action !== 'delete') {
      return res.status(400).json({ error: 'Invalid action' });
    }

    // Mock 응답
    res.json({
      success: true,
      message: `Successfully processed ${userIds.length} users`,
      processedCount: userIds.length
    });
  } catch (error) {
    console.error('Batch operation error:', error);
    return res.status(500).json({ error: 'Batch operation failed' });
  }
}
