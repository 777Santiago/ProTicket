import { apiRequest } from '../config/api';

export interface TicketAPI {
  id_ticket: string;
  order_id: number;
  ticket_code: string;
  pdf_url: string | null;
  qr_code: string | null;
  issued_at: string;
}

export interface CreateTicketData {
  order_id: number;
  pdf_url?: string;
  qr_code?: string;
}

export const ticketsService = {
  // Crear ticket
  create: async (ticketData: CreateTicketData, accessToken: string): Promise<TicketAPI> => {
    return await apiRequest<TicketAPI>('/tickets/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(ticketData),
    });
  },

  // Obtener tickets de una orden
  getByOrder: async (orderId: number, accessToken: string): Promise<TicketAPI[]> => {
    return await apiRequest<TicketAPI[]>(`/tickets/order/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
  },

  // Obtener ticket por código
  getByCode: async (ticketCode: string, accessToken: string): Promise<TicketAPI> => {
    return await apiRequest<TicketAPI>(`/tickets/code/${ticketCode}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
  },
};
