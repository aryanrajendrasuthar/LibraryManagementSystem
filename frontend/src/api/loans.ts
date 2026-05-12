import api from './client';
import type { Loan, Page } from '../types';

export const borrowBook = (bookId: number) =>
  api.post<Loan>(`/loans/borrow/${bookId}`).then((r) => r.data);

export const returnBook = (loanId: number) =>
  api.patch<Loan>(`/loans/${loanId}/return`).then((r) => r.data);

export const adminReturnBook = (loanId: number) =>
  api.patch<Loan>(`/loans/${loanId}/admin-return`).then((r) => r.data);

export const getMyLoans = (page = 0, size = 10) =>
  api.get<Page<Loan>>('/loans/my', { params: { page, size } }).then((r) => r.data);

export const getAllLoans = (page = 0, size = 20) =>
  api.get<Page<Loan>>('/loans', { params: { page, size } }).then((r) => r.data);
