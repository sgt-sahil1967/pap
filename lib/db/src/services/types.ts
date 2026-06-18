export interface Product {
  id: number;
  handle: string;
  title: string;
  body: string;
  type: string;
  category: string;
  tags: string;
  images: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: number;
  productId: number;
  size: string;
  color: string | null;
  price: number;
  comparePrice: number | null;
  sku: string;
  inventoryQty: number;
  inventoryReserved: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductWithVariants extends Product {
  variants: ProductVariant[];
}

export interface ProductListItem {
  id: number;
  handle: string;
  title: string;
  type: string;
  category: string;
  images: string[];
  status: string;
  createdAt: string;
  variantCount: number;
  minPrice: number | null;
}

export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface OrderItem {
  productId: string;
  variantId: number;
  title: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerId: number | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  paymentStatus: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: number;
  productId: number;
  productTitle: string;
  size: string;
  sku: string;
  inventoryQty: number;
  inventoryReserved: number;
}

export interface InventoryLog {
  id: number;
  productId: number;
  variantId: number;
  delta: number;
  reason: string;
  orderId: number | null;
  createdAt: string;
}

export interface Banner {
  id: string;
  imageUrl: string;
  link: string;
  alt: string;
  enabled: boolean;
}

export interface HomepageSettings {
  id: number;
  banners: Banner[];
  announcementText: string;
  announcementEnabled: boolean;
  updatedAt: string;
}

export interface PaymentLog {
  id: number;
  orderId: number;
  merchantTransactionId: string;
  phonePeTransactionId: string | null;
  amount: number;
  status: string;
  provider: string;
  requestPayload: Record<string, unknown> | null;
  responsePayload: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}
