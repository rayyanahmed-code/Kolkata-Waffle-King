export type OrderType = 'delivery' | 'pickup';

export type StepId = 
  | 'welcome'
  | 'name'
  | 'phone'
  | 'order_type'
  | 'location'
  | 'menu'
  | 'summary'
  | 'payment'
  | 'payment_confirmation'
  | 'completed';

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  price: number;
  description: string;
  image: string;
  badge?: string;
  isPopular?: boolean;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  notes?: string;
}

export interface CustomerLocation {
  type: 'geo' | 'manual';
  address?: string;
  mapsUrl?: string;
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
}

export interface OrderState {
  customerName: string;
  customerPhone: string;
  orderType: OrderType | null;
  location: CustomerLocation | null;
  cart: CartItem[];
  specialInstructions: string;
  paymentScreenshot?: string;
  paymentScreenshotFile?: File;
}

export interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  timestamp: string;
  stepId?: StepId;
  options?: Array<{
    label: string;
    value: string;
    icon?: string;
  }>;
}
