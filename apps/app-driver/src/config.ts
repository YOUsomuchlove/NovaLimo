/**
 * Cấu hình API. Trên Android emulator, thay localhost bằng 10.0.2.2.
 * Expo: đặt EXPO_PUBLIC_API_URL trong .env
 */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ||
  'http://localhost:3000/api';
