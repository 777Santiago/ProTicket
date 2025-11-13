import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { Header } from "./components/Header";
import { EventList } from "./components/EventList";
import { EventDetails } from "./components/EventDetails";
import { PurchaseFlow } from "./components/PurchaseFlow";
import { TicketConfirmation } from "./components/TicketConfirmation";
import { OrganizerDashboard } from "./components/OrganizerDashboard";
import { CreateEventForm } from "./components/CreateEventForm";
import { LoginModal } from "./components/LoginModal";
import { SignupModal } from "./components/SignupModal";
import { ForgotPasswordModal } from "./components/ForgotPasswordModal";
import { MyTickets } from "./components/MyTickets";
import { ServerDiagnostic } from "./components/ServerDiagnostic";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner@2.0.3";
import { projectId, publicAnonKey } from "./utils/supabase/info";
import { Loader2 } from "lucide-react";
import { useLanguage } from "./contexts/LanguageContext";
import { eventsService } from "./services/events.service";
import { ordersService } from "./services/orders.service";
import { ticketsService } from "./services/tickets.service";

function AppContent() {
  const { user, accessToken, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [currentView, setCurrentView] = useState<string>("home");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [purchaseData, setPurchaseData] = useState<any>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const selectedEvent = events.find(e => e.id === selectedEventId) || myEvents.find(e => e.id === selectedEventId);
  const [editingEvent, setEditingEvent] = useState<any>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (user?.role === "organizer" && accessToken) {
      fetchMyEvents();
    }
  }, [user, accessToken]);

  async function fetchEvents() {
    try {
      console.log("Fetching events from Python backend...");

      const eventsData = await eventsService.getAll();
      console.log(`Events received: ${eventsData.length}`);

      setEvents(eventsData);
      setApiError(null);
    } catch (error: any) {
      console.error("Error fetching events:", error);
      setApiError(error.message);
      toast.error("Error al cargar eventos desde el backend");
    } finally {
      setLoading(false);
    }
  }

  async function fetchMyEvents() {
    if (!accessToken || !user) {
      console.log("⚠️ fetchMyEvents: No accessToken o user", { hasToken: !!accessToken, hasUser: !!user });
      return;
    }

    try {
      console.log("📊 Fetching my events for user:", user.id);
      
      // Obtener eventos del organizador actual
      const myEventsData = await eventsService.getByCreator(user.id, accessToken);
      console.log("✅ Eventos obtenidos:", myEventsData.length, myEventsData);
      
      // Obtener órdenes de los eventos del organizador
      let orders = [];
      try {
        orders = await ordersService.getByOrganizer(user.id, accessToken);
        console.log("✅ Órdenes obtenidas:", orders.length);
      } catch (orderError) {
        console.warn("⚠️ Error obteniendo órdenes (continuando sin órdenes):", orderError);
        // Continuar sin órdenes si hay error
      }
      
      // Crear un mapa de event_id -> órdenes para calcular estadísticas
      const ordersByEvent = new Map<number, typeof orders>();
      orders.forEach(order => {
        if (!ordersByEvent.has(order.event_id)) {
          ordersByEvent.set(order.event_id, []);
        }
        ordersByEvent.get(order.event_id)!.push(order);
      });

      // Transformar a formato del dashboard con estadísticas reales
      const dashboardEvents = myEventsData.map(event => {
        const eventOrders = ordersByEvent.get(parseInt(event.id)) || [];
        const ticketsSold = eventOrders.reduce((sum, order) => sum + order.quantity, 0);
        const revenue = eventOrders
          .filter(order => order.status === "paid" || order.status === "confirmed")
          .reduce((sum, order) => sum + parseFloat(order.total_price.toString()), 0);
        
        // Calcular tasa de conversión (tickets vendidos / capacidad total)
        const conversionRate = event.totalTickets > 0 
          ? (ticketsSold / event.totalTickets) * 100 
          : 0;

        return {
          id: event.id,
          title: event.title,
          date: event.date,
          status: event.status || "active",
          ticketsSold,
          totalTickets: event.totalTickets,
          revenue,
          conversionRate: Math.round(conversionRate * 10) / 10, // Redondear a 1 decimal
        };
      });

      console.log("📊 Dashboard events preparados:", dashboardEvents);
      setMyEvents(dashboardEvents);
    } catch (error: any) {
      console.error("❌ Error fetching my events:", error);
      console.error("❌ Error details:", {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      toast.error(`Error al cargar tus eventos: ${error.message || "Error desconocido"}`);
      // Establecer array vacío en caso de error para evitar mostrar datos antiguos
      setMyEvents([]);
    }
  }

  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setCurrentView("details");
  };

  const handleBuyTickets = () => {
    if (!user) {
      toast.error(t("message.loginRequired"));
      setShowLogin(true);
      return;
    }

    if (user.role !== "buyer") {
      toast.error(t("message.buyersOnly"));
      return;
    }

    setCurrentView("purchase");
  };

  const handlePurchaseComplete = async (data: any) => {
    if (!accessToken || !selectedEvent || !user) {
      toast.error("Usuario no autenticado");
      return;
    }

    try {
      console.log("Creating order with buyer_id:", user.id);

      // Crear la orden con el buyer_id del usuario autenticado
      const order = await ordersService.create(
        {
          event_id: parseInt(selectedEvent.id),
          quantity: data.quantity,
          buyer_id: user.id, // AGREGADO - enviar el ID del usuario
        },
        accessToken
      );

      console.log("Order created:", order);

      // Crear tickets para la orden
      const tickets = [];
      for (let i = 0; i < data.quantity; i++) {
        const ticket = await ticketsService.create(
          {
            order_id: order.id_order,
            qr_code: `QR-${order.id_order}-${i + 1}`,
          },
          accessToken
        );
        tickets.push(ticket);
      }

      console.log("Tickets created:", tickets);

      // Generar código de confirmación
      const confirmationCode = tickets[0]?.ticket_code || `PT-${order.id_order}`;

      setPurchaseData({
        ...data,
        orderId: order.id_order,
        confirmationCode: confirmationCode,
        totalPrice: order.total_price,
        status: order.status,
        tickets: tickets,
      });

      setCurrentView("confirmation");
      toast.success(t("message.purchaseSuccess"));

      // Refrescar eventos
      await fetchEvents();
    } catch (error: any) {
      console.error("Purchase error:", error);
      toast.error(error.message || "Error al procesar la compra");
    }
  };

  const handleCreateEvent = async (eventData: any) => {
    if (!accessToken || !user) {
      toast.error(t("message.loginRequired"));
      return;
    }

    if (user.role !== "organizer") {
      toast.error(t("message.organizersOnly"));
      return;
    }

    try {
      console.log("Creating event:", eventData);

      const newEvent = await eventsService.create(eventData, accessToken);

      console.log("✅ Event created:", newEvent);
      console.log("🔄 Refrescando eventos del dashboard...");

      // Esperar un momento para que el backend procese
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await fetchEvents();
      await fetchMyEvents();
      
      console.log("✅ Eventos refrescados");
      setCurrentView("dashboard");
      setEditingEventId(null);
      toast.success(t("message.eventCreated"));
    } catch (error: any) {
      console.error("Create event error:", error);
      const errorMessage = error.message || "Error al crear evento";

      // Extraer mensaje del servidor si existe
      if (errorMessage.includes("403")) {
        toast.error("No tienes permiso para crear eventos");
      } else if (errorMessage.includes("401")) {
        toast.error("Debes iniciar sesión para crear eventos");
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleUpdateEvent = async (eventData: any) => {
    if (!accessToken || !editingEventId || !user) {
      toast.error(t("message.loginRequired"));
      return;
    }

    if (user.role !== "organizer") {
      toast.error(t("message.organizersOnly"));
      return;
    }

    try {
      console.log("Updating event:", editingEventId, eventData);

      await eventsService.update(parseInt(editingEventId), eventData, accessToken);

      await fetchEvents();
      await fetchMyEvents();
      setCurrentView("dashboard");
      setEditingEventId(null);
      setEditingEvent(null);
      toast.success(t("message.eventUpdated"));
    } catch (error: any) {
      console.error("Update event error:", error);
      const errorMessage = error.message || "Error al actualizar evento";

      // Extraer mensaje del servidor si existe
      if (errorMessage.includes("403") || errorMessage.includes("permiso")) {
        toast.error("No tienes permiso para editar este evento. Solo el creador puede modificarlo.");
      } else if (errorMessage.includes("401")) {
        toast.error("Debes iniciar sesión para editar eventos");
      } else if (errorMessage.includes("404")) {
        toast.error("Evento no encontrado");
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!accessToken || !user) {
      toast.error(t("message.loginRequired"));
      return;
    }

    if (user.role !== "organizer") {
      toast.error(t("message.organizersOnly"));
      return;
    }

    try {
      console.log("Deleting event:", eventId);

      await eventsService.delete(parseInt(eventId), accessToken);

      await fetchEvents();
      await fetchMyEvents();
      toast.success(t("message.eventDeleted"));
    } catch (error: any) {
      console.error("Delete event error:", error);
      const errorMessage = error.message || "Error al eliminar evento";

      // Extraer mensaje del servidor si existe
      if (errorMessage.includes("403") || errorMessage.includes("permiso")) {
        toast.error("No tienes permiso para eliminar este evento. Solo el creador puede eliminarlo.");
      } else if (errorMessage.includes("401")) {
        toast.error("Debes iniciar sesión para eliminar eventos");
      } else if (errorMessage.includes("404")) {
        toast.error("Evento no encontrado");
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleEditEvent = async (eventId: string) => {
    if (!accessToken) {
      toast.error(t("message.loginRequired"));
      return;
    }

    try {
      // Obtener el evento completo desde el backend
      const eventData = await eventsService.getById(parseInt(eventId));
      setEditingEvent(eventData);
      setEditingEventId(eventId);
      setCurrentView("edit");
    } catch (error: any) {
      console.error("Error fetching event for edit:", error);
      toast.error("Error al cargar el evento para editar");
    }
  };

  const handleNavigate = (view: string) => {
    if (view === "dashboard" && (!user || user.role !== "organizer")) {
      toast.error(t("message.organizersOnly"));
      return;
    }

    if (view === "my-tickets" && (!user || user.role !== "buyer")) {
      toast.error(t("message.buyersCanViewTickets"));
      return;
    }

    setCurrentView(view);
    setEditingEventId(null);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenLogin={() => setShowLogin(true)}
        onOpenSignup={() => setShowSignup(true)}
      />

      {currentView === "diagnostic" && <ServerDiagnostic />}

      {currentView === "home" && (
        <EventList
          events={events}
          onSelectEvent={handleSelectEvent}
        />
      )}

      {currentView === "details" && selectedEvent && (
        <EventDetails
          event={selectedEvent}
          onBack={() => setCurrentView("home")}
          onBuyTickets={handleBuyTickets}
        />
      )}

      {currentView === "purchase" && selectedEvent && (
        <PurchaseFlow
          event={selectedEvent}
          onBack={() => setCurrentView("details")}
          onComplete={handlePurchaseComplete}
        />
      )}

      {currentView === "confirmation" && purchaseData && selectedEvent && (
        <TicketConfirmation
          purchase={purchaseData}
          event={selectedEvent}
          onBackToEvents={() => {
            setCurrentView("home");
            setSelectedEventId(null);
            setPurchaseData(null);
          }}
        />
      )}

      {currentView === "my-tickets" && (
        <MyTickets />
      )}

      {currentView === "dashboard" && (
        <OrganizerDashboard
          events={myEvents}
          onCreateEvent={() => {
            setEditingEventId(null);
            setCurrentView("create");
          }}
          onEditEvent={handleEditEvent}
          onDeleteEvent={handleDeleteEvent}
        />
      )}

      {currentView === "create" && (
        <CreateEventForm
          onBack={() => {
            setCurrentView("dashboard");
            setEditingEventId(null);
          }}
          onSubmit={handleCreateEvent}
        />
      )}

      {currentView === "edit" && editingEvent && (
        <CreateEventForm
          onBack={() => {
            setCurrentView("dashboard");
            setEditingEventId(null);
            setEditingEvent(null);
          }}
          onSubmit={handleUpdateEvent}
          editEvent={editingEvent}
        />
      )}

      <LoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onSwitchToSignup={() => {
          setShowLogin(false);
          setShowSignup(true);
        }}
        onSwitchToForgotPassword={() => {
          setShowLogin(false);
          setShowForgotPassword(true);
        }}
      />

      <SignupModal
        open={showSignup}
        onClose={() => setShowSignup(false)}
        onSwitchToLogin={() => {
          setShowSignup(false);
          setShowLogin(true);
        }}
      />

      <ForgotPasswordModal
        open={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onBackToLogin={() => {
          setShowForgotPassword(false);
          setShowLogin(true);
        }}
      />

      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}
