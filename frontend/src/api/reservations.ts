import api from './client';
import type { Reservation } from '../types';

export const reserveBook = (bookId: number) =>
  api.post<Reservation>(`/reservations/books/${bookId}`).then((r) => r.data);

export const cancelReservation = (id: number) =>
  api.patch(`/reservations/${id}/cancel`);

export const getMyReservations = () =>
  api.get<Reservation[]>('/reservations/my').then((r) => r.data);

export const getAllReservations = () =>
  api.get<Reservation[]>('/reservations').then((r) => r.data);
