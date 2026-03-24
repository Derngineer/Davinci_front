import api from './api';

export interface OutlineRequest {
  student_name: string;
  grade: string;
  subject: string;
  exam_board: string;
  curriculum: string;
  course_content: string;
}

export interface OutlineResponse {
  student_name: string;
  grade: string;
  subject: string;
  exam_board: string;
  course_outline: string; // HTML table
}

/**
 * Generate a course outline checklist.
 * POST /api/outline-checklist/
 */
export async function generateOutline(data: OutlineRequest): Promise<OutlineResponse> {
  const res = await api.post('/outline-checklist/', data);
  return res.data;
}
