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
  buyer_id: string;
}

export const ordersService = {
  // Crear una orden
  create: async (orderData: CreateOrderData, accessToken: string): Promise<OrderAPI> => {
    console.log("Creating order with data:", orderData);
    console.log("Stringified data:", JSON.stringify(orderData));
    
    const response = await apiRequest<OrderAPI>('/orders/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    
    console.log("Order created:", response);
    return response;
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
    console.log("Fetching orders for user:", userId);
    
    const response = await apiRequest<OrderAPI[]>(`/orders/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    console.log("Orders fetched:", response);
    return response;
  },

  // Obtener órdenes de eventos de un organizador
  getByOrganizer: async (creatorUserId: string, accessToken: string): Promise<OrderAPI[]> => {
    console.log("Fetching orders for organizer:", creatorUserId);
    
    const response = await apiRequest<OrderAPI[]>(`/orders/organizer/${creatorUserId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    console.log("Organizer orders fetched:", response);
    return response;
  },
};