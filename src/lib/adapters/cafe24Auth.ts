import { Cafe24Auth } from '../types/cafe24';

export async function getCafe24Token(auth: Cafe24Auth): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
  // mock: 실제는 code로 토큰 발급
  return {
    accessToken: 'mock_access_token',
    refreshToken: 'mock_refresh_token',
    expiresIn: 3600,
  };
}
