export interface OrderItem {
  productName: string;
  code: string;
  quantity: number;
  unit: string; // e.g., 'GL', 'BD 18L', 'QTE'
  unitPrice: string; // e.g., 'R$ 47,91'
  totalPrice: string; // e.g., 'R$ 383,28'
}

export interface ClientInfo {
  address: string;
  neighborhood: string;
  city: string;
  zip: string;
  stateId: string;
  cnpj: string;
  deliveryAddress: string;
}

export interface PurchaseOrder {
  sellerName: string;
  clientName: string;
  clientCode: string;
  orderDate: string;
  clientInfo: ClientInfo;
  paymentCondition: string;
  collectionType: string;
  observations: string;
  items: OrderItem[];
  totalValue: string;
}