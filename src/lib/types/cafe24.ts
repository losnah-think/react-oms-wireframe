export type Cafe24Auth = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  code?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
  scope?: string;
};

export type Cafe24Order = {
  orderId: string;
  orderCode: string;
  memberId: string;
  orderStatus: string;
  orderDate: string;
  items: Cafe24OrderItem[];
  shipping: Cafe24Shipping;
  payment: Cafe24Payment;
};

export type Cafe24OrderItem = {
  productNo: string;
  productName: string;
  quantity: number;
  price: number;
};

export type Cafe24Shipping = {
  receiverName: string;
  address: string;
  status: string;
};

export type Cafe24Payment = {
  method: string;
  amount: number;
  status: string;
};
