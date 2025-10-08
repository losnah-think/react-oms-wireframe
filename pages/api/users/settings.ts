import { NextApiRequest, NextApiResponse } from "next";

// Mock: localStorage를 대신한 메모리 저장소 (서버 사이드용)
const mockUserSettings: { [userId: string]: { defaultClassificationId?: string | null } } = {};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // 목업 모드 체크
    const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "1" || process.env.NODE_ENV !== "production";
    
    if (!useMocks) {
      return res.status(404).json({ error: "Not found" });
    }

    const userId = req.query.userId as string || req.body.userId || "mock-user-1";

    if (req.method === "GET") {
      // 사용자 설정 조회 (목업)
      const settings = mockUserSettings[userId] || {};
      
      res.setHeader("Cache-Control", "no-store");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      
      return res.status(200).json({
        defaultClassificationId: settings.defaultClassificationId || null,
      });
    }

    if (req.method === "PUT" || req.method === "PATCH") {
      // 사용자 설정 업데이트 (목업)
      const { defaultClassificationId } = req.body;

      mockUserSettings[userId] = {
        defaultClassificationId: defaultClassificationId || null,
      };

      res.setHeader("Cache-Control", "no-store");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");

      return res.status(200).json({
        success: true,
        defaultClassificationId: mockUserSettings[userId].defaultClassificationId,
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error in /api/users/settings:", error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : "Internal server error" 
    });
  }
}

