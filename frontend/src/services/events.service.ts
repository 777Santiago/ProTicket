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
  status?: string;
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
    category: "Música", // Default por ahora
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
    availableTickets: apiEvent.capacity || 0,
    totalTickets: apiEvent.capacity || 0,
    organizerName: "Organizador",
    status: apiEvent.status,
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
  // Convertir datos del formulario a formato API
  const apiData = {
    title: eventData.title,
    description: eventData.description,
    location: eventData.location,
    start_datetime: `${eventData.date}T${eventData.time}:00`,
    price: parseFloat(eventData.price),
    capacity: parseInt(eventData.totalTickets),
    organizer_id: 1, // Por ahora usamos ID fijo
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
  // Actualizar evento
update: async (id: number, eventData: any, accessToken: string): Promise<EventUI> => {
  // Convertir datos del formulario a formato API
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
};
