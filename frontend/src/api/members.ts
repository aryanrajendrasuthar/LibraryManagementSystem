import api from './client';
import type { Member, Page } from '../types';

export const getProfile = () =>
  api.get<Member>('/members/me').then((r) => r.data);

export const getMembers = (params: { query?: string; page?: number; size?: number } = {}) =>
  api.get<Page<Member>>('/members', { params }).then((r) => r.data);

export const getMember = (id: number) =>
  api.get<Member>(`/members/${id}`).then((r) => r.data);

export const updateRole = (id: number, role: string) =>
  api.patch<Member>(`/members/${id}/role`, null, { params: { role } }).then((r) => r.data);

export const toggleActive = (id: number) =>
  api.patch<Member>(`/members/${id}/toggle-active`).then((r) => r.data);
