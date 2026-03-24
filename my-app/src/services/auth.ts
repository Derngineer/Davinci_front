import api from './api';

export interface SignupData {
  email: string;
  confirm_email: string;
  first_name: string;
  last_name: string;
  password: string;
  country: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  daily_count: number;
  is_paid: boolean;
  is_trial: boolean;
  email_verified: boolean;
  is_premium_active: boolean;
  last_query_date: string | null;
  premium_start_date: string | null;
  premium_end_date: string | null;
  referral_count: number;
  country: string;
}

export async function signup(data: SignupData) {
  const res = await api.post('/accounts/signup/', data);
  return res.data;
}

export async function login(data: LoginData) {
  const res = await api.post('/accounts/login/', data);
  return res.data; // { token, ... }
}

export async function logout() {
  await api.post('/accounts/logout/');
  localStorage.removeItem('dv_token');
}

export async function getDashboard(): Promise<UserProfile> {
  const res = await api.get('/accounts/dashboard/');
  // API returns { user: {...}, profile: {...} } — extract the user object
  return res.data.user ?? res.data;
}

export async function changePassword(old_password: string, new_password: string) {
  const res = await api.post('/accounts/change-password/', { old_password, new_password });
  return res.data;
}
