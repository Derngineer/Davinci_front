import api from './api';

// ── Grade response types matching the API JSON schema ────────

export interface GradeCriterion {
  code: string;
  name: string;
  score: number;
  max_score: number;
  priority: 'high' | 'medium' | 'low';
  page_ref: string;
  feedback: string;
  improvement: string;
}

export interface GradeData {
  subject: string;
  document_type: string;
  overall_score: number;
  overall_max: number;
  grade_boundary: string;
  estimated_range: string;
  summary: string;
  strongest_criterion: string;
  priority_order: string[];
  criteria: GradeCriterion[];
  top_priorities: string[];
  do_not_touch: string;
  regrade_note: string;
}

/**
 * Upload an image file for grading.
 * POST /api/grade/
 */
export async function gradeUploadedImage(file: File): Promise<GradeData> {
  const formData = new FormData();
  formData.append('image', file);
  const res = await api.post('/grade/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

/**
 * Upload a document (PDF, DOCX, TXT) for grading.
 * POST /api/grade-document/
 */
export async function gradeDocument(file: File): Promise<GradeData> {
  const formData = new FormData();
  formData.append('document', file);
  const res = await api.post('/grade-document/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}
