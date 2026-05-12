export interface AuthResponse {
  token: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'LIBRARIAN' | 'MEMBER';
  membershipId: string;
}

export interface Book {
  id: number;
  isbn: string;
  title: string;
  author: string;
  category: string;
  publisher?: string;
  publishedYear?: number;
  totalCopies: number;
  availableCopies: number;
  available: boolean;
  coverUrl?: string;
  description?: string;
  createdAt: string;
}

export interface Loan {
  id: number;
  bookId: number;
  bookTitle: string;
  bookIsbn: string;
  bookAuthor: string;
  bookCoverUrl?: string;
  memberId: number;
  memberName: string;
  memberEmail: string;
  borrowedAt: string;
  dueDate: string;
  returnedAt?: string;
  fineAmount: number;
  finePaid: boolean;
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE';
  overdue: boolean;
}

export interface Reservation {
  id: number;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  bookIsbn: string;
  bookCoverUrl?: string;
  memberId: number;
  memberName: string;
  reservedAt: string;
  status: 'PENDING' | 'FULFILLED' | 'CANCELLED' | 'EXPIRED';
}

export interface Member {
  id: number;
  name: string;
  email: string;
  membershipId: string;
  role: 'ADMIN' | 'LIBRARIAN' | 'MEMBER';
  borrowingLimit: number;
  active: boolean;
  createdAt: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface AnalyticsDashboard {
  totalBooks: number;
  totalMembers: number;
  activeLoans: number;
  overdueLoans: number;
  booksByCategory: Record<string, number>;
  loansPerMonth: Record<string, number>;
}
