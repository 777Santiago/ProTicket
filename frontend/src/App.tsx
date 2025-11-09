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

  const selectedEvent = events.find(e => e.id === selectedEventId) || myEvents.find(e => e.id === selectedEventId);
  const editingEvent = myEvents.find(e => e.id === editingEventId);

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
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-45ce65c6/events`;
      console.log("=== Fetching Events ===");
      console.log("URL:", url);
      console.log("Project ID:", projectId);
      console.log("Authorization header:", `Bearer ${publicAnonKey.substring(0, 20)}...`);
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${publicAnonKey}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", response.status, response.statusText);
      console.log("Response headers:", Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log("Events received:", data.events?.length || 0);
        console.log("Sample event:", data.events?.[0] ? JSON.stringify(data.events[0]).substring(0, 100) : "No events");
        setEvents(data.events || []);
      } else {
        const errorText = await response.text();
        console.error("Response error:", response.status, errorText);
        toast.error("Error al cargar eventos");
      }
    } catch (error: any) {
      console.error("=== Fetch Error ===");
      console.error("Error type:", error?.constructor?.name);
      console.error("Error message:", error?.message);
      console.error("Error stack:", error?.stack);
      console.error("Full error:", error);
      toast.error("Error al cargar eventos. Verifica la conexión.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchMyEvents() {
    if (!accessToken) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-45ce65c6/events/my-events`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMyEvents(data.events || []);
      }
    } catch (error) {
      console.error("Error fetching my events:", error);
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
    if (!accessToken || !selectedEvent) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-45ce65c6/purchases`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            eventId: selectedEvent.id,
            eventTitle: selectedEvent.title,
            eventDate: selectedEvent.date,
            eventTime: selectedEvent.time,
            eventLocation: selectedEvent.location,
            quantity: data.quantity,
            buyerName: data.buyerName,
            buyerEmail: data.buyerEmail,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al procesar la compra");
      }

      const result = await response.json();
      setPurchaseData({
        ...data,
        confirmationCode: result.purchase.confirmationCode,
      });
      setCurrentView("confirmation");
      toast.success(t("message.purchaseSuccess"));
      
      // Refresh events to update ticket count
      await fetchEvents();
    } catch (error: any) {
      console.error("Purchase error:", error);
      toast.error(error.message || "Error al procesar la compra");
    }
  };

  const handleCreateEvent = async (eventData: any) => {
    if (!accessToken) {
      toast.error(t("message.loginRequired"));
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-45ce65c6/events`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(eventData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear evento");
      }

      await fetchEvents();
      await fetchMyEvents();
      setCurrentView("dashboard");
      setEditingEventId(null);
      toast.success(t("message.eventCreated"));
    } catch (error: any) {
      console.error("Create event error:", error);
      toast.error(error.message || "Error al crear evento");
    }
  };

  const handleUpdateEvent = async (eventData: any) => {
    if (!accessToken || !editingEventId) {
      toast.error(t("message.loginRequired"));
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-45ce65c6/events/${editingEventId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(eventData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar evento");
      }

      await fetchEvents();
      await fetchMyEvents();
      setCurrentView("dashboard");
      setEditingEventId(null);
      toast.success(t("message.eventUpdated"));
    } catch (error: any) {
      console.error("Update event error:", error);
      toast.error(error.message || "Error al actualizar evento");
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!accessToken) {
      toast.error(t("message.loginRequired"));
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-45ce65c6/events/${eventId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar evento");
      }

      await fetchEvents();
      await fetchMyEvents();
      toast.success(t("message.eventDeleted"));
    } catch (error: any) {
      console.error("Delete event error:", error);
      toast.error(error.message || "Error al eliminar evento");
    }
  };

  const handleEditEvent = (eventId: string) => {
    setEditingEventId(eventId);
    setCurrentView("edit");
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
