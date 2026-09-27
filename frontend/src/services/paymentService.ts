import api from "./api";

export interface CreateOrderRequest {
  room_id: number;
  check_in: string;
  check_out: string;
  guests: number;
}

export interface CreateOrderResponse {
  booking_id: number;
  booking_reference: string;
  razorpay_order_id: string;
  razorpay_key_id: string;
  amount: number;
  currency: string;
}

export interface VerifyPaymentRequest {
  booking_id: number;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export async function createPaymentOrder(
  data: CreateOrderRequest
): Promise<CreateOrderResponse> {
  const response = await api.post<CreateOrderResponse>(
    "/api/payments/create-order",
    null,
    {
      params: data,
    }
  );

  return response.data;
}


export async function verifyPayment(
  data: VerifyPaymentRequest
) {
  const response = await api.post(
    "/api/payments/verify",
    data
  );

  return response.data;
}
