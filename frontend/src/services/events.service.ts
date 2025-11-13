import { apiRequest } from '../config/api';

export interface EventAPI {
  id_event: number;
  title: string;
  description: string;
  location: string;
  start_datetime: string;
  price: number;
  capacity: number;
  organizer_id: number;
  creator_user_id?: string;
  status: string;
  created_at?: string;
}

export interface EventUI {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  price: number;
  category: string;
  image: string;
  availableTickets: number;
  totalTickets: number;
  organizerName?: string;
  organizerId?: string;
  creatorUserId?: string;
  status?: string;
  start_datetime?: string; // Para poder parsear fecha/hora correctamente
}

// Convertir de formato API a formato UI
function transformEventFromAPI(apiEvent: EventAPI): EventUI {
  const datetime = new Date(apiEvent.start_datetime);
  
  return {
    id: apiEvent.id_event.toString(),
    title: apiEvent.title,
    description: apiEvent.description,
    location: apiEvent.location,
    date: datetime.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    time: datetime.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    price: apiEvent.price,
    category: "Música",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
    availableTickets: apiEvent.capacity || 0,
    totalTickets: apiEvent.capacity || 0,
    organizerName: "Organizador",
    creatorUserId: apiEvent.creator_user_id,
    status: apiEvent.status,
    start_datetime: apiEvent.start_datetime, // Mantener el datetime original para edición
  };
}

export const eventsService = {
  // Obtener todos los eventos
  getAll: async (): Promise<EventUI[]> => {
    const events = await apiRequest<EventAPI[]>('/events/');
    return events.map(transformEventFromAPI);
  },

  // Obtener un evento por ID
  getById: async (id: number): Promise<EventUI> => {
    const event = await apiRequest<EventAPI>(`/events/${id}`);
    return transformEventFromAPI(event);
  },

  // Crear evento (organizers)
  create: async (eventData: any, accessToken: string): Promise<EventUI> => {
    const apiData = {
      title: eventData.title,
      description: eventData.description,
      location: eventData.location,
      start_datetime: `${eventData.date}T${eventData.time}:00`,
      price: parseFloat(eventData.price),
      capacity: parseInt(eventData.totalTickets),
      organizer_id: 1,
      status: "active",
    };

    const event = await apiRequest<EventAPI>('/events/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(apiData),
    });
    return transformEventFromAPI(event);
  },

  // Actualizar evento
  update: async (id: number, eventData: any, accessToken: string): Promise<EventUI> => {
    const apiData = {
      title: eventData.title,
      description: eventData.description,
      location: eventData.location,
      start_datetime: `${eventData.date}T${eventData.time}:00`,
      price: parseFloat(eventData.price),
      capacity: parseInt(eventData.totalTickets),
      organizer_id: 1,
      status: eventData.status || "active",
    };

    const event = await apiRequest<EventAPI>(`/events/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(apiData),
    });
    return transformEventFromAPI(event);
  },

  // Eliminar evento
  delete: async (id: number, accessToken: string): Promise<void> => {
    await apiRequest(`/events/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
  },

  // Obtener eventos por creador (organizador)
  getByCreator: async (creatorUserId: string, accessToken: string): Promise<EventUI[]> => {
    console.log(`🔍 Obteniendo eventos para creator: ${creatorUserId}`);
    try {
      const events = await apiRequest<EventAPI[]>(`/events/creator/${creatorUserId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      console.log(`✅ Eventos recibidos del API:`, events);
      return events.map(transformEventFromAPI);
    } catch (error: any) {
      console.error(`❌ Error en getByCreator:`, error);
      throw error;
    }
  },
};