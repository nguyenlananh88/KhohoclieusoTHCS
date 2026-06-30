export interface Product {
  id: string;
  title: string;
  subject: string;
  grade: number;
  type: string;
  price: number;
  originalPrice: number;
  rating: number;
  sales: number;
  tag: string;
  isFree: boolean;
  image: string;
  description: string;
  fileData?: string;
  fileName?: string;
}

export interface Initiative {
  id: string;
  category: string;
  title: string;
  author: string;
  desc: string;
  price: number;
  sales: number;
  downloads: number;
  image?: string;
}

export interface Order {
  id: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerBankName?: string;
  buyerBankAccount?: string;
  buyerBankAccountName?: string;
  totalAmount: number;
  items: any[];
  status: 'pending' | 'paid' | 'declined';
  createdAt: string;
}

export interface Feedback {
  id: string;
  name: string;
  email: string;
  msg: string;
  createdAt: string;
}

export interface AdminState {
  isLoggedIn: boolean;
  token: string | null;
}
