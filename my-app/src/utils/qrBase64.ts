/**
 * qrBase64.ts
 * Loads the DaVinci Solver QR code PNG and returns it as a base64 data-URL.
 * Caches the result so subsequent calls are instant.
 */

import qrUrl from '../assets/qrcode_davincisolver.com.png';

let cached: string | null = null;

/**
 * Returns a base64 data-URL of the QR code PNG.
 * Works in both html2pdf (<img src>) and jsPDF (addImage) contexts.
 */
export async function getQrBase64(): Promise<string> {
  if (cached) return cached;

  const res = await fetch(qrUrl);
  const blob = await res.blob();

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      cached = reader.result as string;
      resolve(cached);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
