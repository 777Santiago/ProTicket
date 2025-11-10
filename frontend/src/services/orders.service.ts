import { apiRequest } from '../config/api';

export interface OrderAPI {
  id_order: number;
  buyer_id: string;
  event_id: number;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string;
}

export interface CreateOrderData {
  event_id: number;
  quantity: number;
}

export const ordersService = {
  // Crear una orden
  create: async (orderData: CreateOrderData, accessToken: string): Promise<OrderAPI> => {
    return await apiRequest<OrderAPI>('/orders/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderData),
    });
  },

  // Obtener orden por ID
  getById: async (orderId: number, accessToken: string): Promise<OrderAPI> => {
    return await apiRequest<OrderAPI>(`/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
  },

  // Obtener órdenes de un usuario
  getByUser: async (userId: string, accessToken: string): Promise<OrderAPI[]> => {
    return await apiRequest<OrderAPI[]>(`/orders/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
  },
};
