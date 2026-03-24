import api from './api';

export interface SolveResponse {
  solution: string;
  remaining_queries: number;
}

/**
 * Submit a captured webcam image (base64 string) for solving.
 */
export async function solveWebcamImage(base64Image: string): Promise<SolveResponse> {
  const res = await api.post('/solve/', { webcam_image: base64Image });
  return res.data;
}

/**
 * Upload an image file for solving.
 */
export async function solveUploadedImage(file: File): Promise<SolveResponse> {
  const formData = new FormData();
  formData.append('image', file);
  const res = await api.post('/solve/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

/**
 * Upload a document (PDF, DOCX, etc.) for solving.
 */
export async function solveDocument(file: File): Promise<SolveResponse> {
  const formData = new FormData();
  formData.append('document', file);
  const res = await api.post('/solve-document/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}
