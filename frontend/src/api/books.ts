import api from './client';
import type { Book, Page } from '../types';

export const getBooks = (params: Record<string, unknown>) =>
  api.get<Page<Book>>('/books', { params }).then((r) => r.data);

export const getBook = (id: number) =>
  api.get<Book>(`/books/${id}`).then((r) => r.data);

export const getCategories = () =>
  api.get<string[]>('/books/categories').then((r) => r.data);

export const isbnLookup = (isbn: string) =>
  api.get<Record<string, unknown>>(`/books/isbn-lookup/${isbn}`).then((r) => r.data);

export const createBook = (data: unknown) =>
  api.post<Book>('/books', data).then((r) => r.data);

export const updateBook = (id: number, data: unknown) =>
  api.put<Book>(`/books/${id}`, data).then((r) => r.data);

export const deleteBook = (id: number) =>
  api.delete(`/books/${id}`);
