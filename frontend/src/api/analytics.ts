import api from './client';
import type { AnalyticsDashboard } from '../types';

export const getDashboard = () =>
  api.get<AnalyticsDashboard>('/analytics/dashboard').then((r) => r.data);
