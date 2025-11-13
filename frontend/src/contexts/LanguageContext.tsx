import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "es" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  formatDate: (dateString: string, timeString?: string) => string;
  formatDateTime: (isoString: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  es: {
    // Header
    "header.home": "Inicio",
    "header.dashboard": "Dashboard",
    "header.myTickets": "Mis Entradas",
    "header.login": "Iniciar Sesión",
    "header.signup": "Registrarse",
    "header.logout": "Cerrar Sesión",
    
    // Home
    "home.title": "Próximos Eventos",
    "home.subtitle": "Descubre los mejores eventos cerca de ti",
    "home.search": "Buscar eventos...",
    "home.allCategories": "Todas las categorías",
    "home.noEvents": "No hay eventos disponibles",
    
    // Event Details
    "event.date": "Fecha",
    "event.time": "Hora",
    "event.location": "Ubicación",
    "event.price": "Precio",
    "event.available": "Disponibles",
    "event.organizer": "Organizador",
    "event.buyTickets": "Comprar Entradas",
    "event.back": "Volver",
    "event.soldOut": "Agotado",
    
    // Purchase Flow
    "purchase.title": "Comprar Entradas",
    "purchase.quantity": "Cantidad",
    "purchase.name": "Nombre completo",
    "purchase.email": "Email",
    "purchase.total": "Total",
    "purchase.continue": "Continuar",
    "purchase.cancel": "Cancelar",
    "purchase.processing": "Procesando compra...",
    
    // Confirmation
    "confirmation.title": "¡Compra Confirmada!",
    "confirmation.subtitle": "Tu compra ha sido procesada exitosamente",
    "confirmation.code": "Código de confirmación",
    "confirmation.tickets": "entradas",
    "confirmation.download": "Descargar PDF",
    "confirmation.backToEvents": "Volver a Eventos",
    
    // Organizer Dashboard
    "dashboard.title": "Panel de Organizador",
    "dashboard.subtitle": "Gestiona tus eventos y monitorea las ventas",
    "dashboard.createEvent": "Crear Evento",
    "dashboard.totalRevenue": "Ingresos Totales",
    "dashboard.ticketsSold": "Entradas Vendidas",
    "dashboard.activeEvents": "Eventos Activos",
    "dashboard.conversionRate": "Tasa de Conversión",
    "dashboard.myEvents": "Mis Eventos",
    "dashboard.sales": "Ventas",
    "dashboard.publishedEvents": "Eventos Publicados",
    "dashboard.salesHistory": "Historial de Ventas",
    "dashboard.event": "Evento",
    "dashboard.status": "Estado",
    "dashboard.soldTotal": "Vendidas / Total",
    "dashboard.revenue": "Ingresos",
    "dashboard.active": "Activo",
    "dashboard.finished": "Finalizado",
    "dashboard.edit": "Editar",
    "dashboard.delete": "Eliminar",
    "dashboard.buyer": "Comprador",
    "dashboard.quantity": "Cantidad",
    "dashboard.confirmed": "Confirmado",
    "dashboard.vsLastMonth": "vs mes anterior",
    "dashboard.totalEvents": "eventos totales",
    "dashboard.ofCapacity": "de capacidad",
    "dashboard.noTicketsSold": "Sin ventas aún",
    "dashboard.noEvents": "Sin eventos",
    
    // Create/Edit Event
    "createEvent.title": "Crear Nuevo Evento",
    "createEvent.editTitle": "Editar Evento",
    "createEvent.subtitle": "Completa la información de tu evento para empezar a vender entradas",
    "createEvent.backToDashboard": "Volver al dashboard",
    "createEvent.basicInfo": "Información Básica",
    "createEvent.eventName": "Nombre del evento",
    "createEvent.description": "Descripción",
    "createEvent.category": "Categoría",
    "createEvent.selectCategory": "Selecciona una categoría",
    "createEvent.dateLocation": "Fecha y Ubicación",
    "createEvent.date": "Fecha",
    "createEvent.time": "Hora",
    "createEvent.timeHelper": "Hora local (se convertirá a UTC)",
    "createEvent.location": "Ubicación",
    "createEvent.ticketsPricing": "Entradas y Precios",
    "createEvent.pricePerTicket": "Precio por entrada",
    "createEvent.ticketQuantity": "Cantidad de entradas",
    "createEvent.eventImage": "Imagen del Evento",
    "createEvent.imageUrl": "URL de la imagen",
    "createEvent.imageHelper": "Proporciona la URL de una imagen para tu evento (opcional)",
    "createEvent.cancel": "Cancelar",
    "createEvent.publish": "Publicar Evento",
    "createEvent.update": "Actualizar Evento",
    "createEvent.required": "*",
    
    // Categories
    "category.music": "Música",
    "category.sports": "Deportes",
    "category.theater": "Teatro",
    "category.conferences": "Conferencias",
    "category.festivals": "Festivales",
    "category.other": "Otro",
    
    // Auth
    "auth.login": "Iniciar Sesión",
    "auth.loginSubtitle": "Ingresa tus credenciales para acceder a tu cuenta",
    "auth.signup": "Crear Cuenta",
    "auth.signupSubtitle": "Únete a ProTicket y comienza a disfrutar de eventos increíbles",
    "auth.email": "Email",
    "auth.password": "Contraseña",
    "auth.fullName": "Nombre completo",
    "auth.accountType": "Tipo de cuenta",
    "auth.buyer": "Comprador",
    "auth.buyerDesc": "Compra entradas para eventos",
    "auth.organizer": "Organizador",
    "auth.organizerDesc": "Crea y gestiona eventos",
    "auth.hasAccount": "¿Ya tienes cuenta?",
    "auth.noAccount": "¿No tienes cuenta?",
    "auth.loginHere": "Inicia sesión aquí",
    "auth.signupHere": "Regístrate aquí",
    "auth.forgotPassword": "¿Olvidaste tu contraseña?",
    "auth.resetPassword": "Restablecer Contraseña",
    "auth.resetSubtitle": "Ingresa tu email para recibir instrucciones",
    "auth.sendResetLink": "Enviar enlace de restablecimiento",
    "auth.backToLogin": "Volver al inicio de sesión",
    "auth.passwordRules": "Mínimo 8 caracteres, una mayúscula, una minúscula y un número",
    "auth.loggingIn": "Iniciando sesión...",
    "auth.creatingAccount": "Creando cuenta...",
    "auth.sending": "Enviando...",
    
    // Messages
    "message.loginRequired": "Debes iniciar sesión para comprar tickets",
    "message.buyersOnly": "Solo los compradores pueden comprar tickets",
    "message.organizersOnly": "Solo los organizadores pueden acceder al dashboard",
    "message.buyersCanViewTickets": "Solo los compradores pueden ver sus tickets",
    "message.purchaseSuccess": "¡Compra realizada con éxito!",
    "message.eventCreated": "Evento creado exitosamente",
    "message.eventUpdated": "Evento actualizado exitosamente",
    "message.eventDeleted": "Evento eliminado exitosamente",
    "message.welcomeBack": "¡Bienvenido de vuelta!",
    "message.accountCreated": "¡Cuenta creada exitosamente!",
    "message.resetLinkSent": "Enlace de restablecimiento enviado a tu email",
    "message.accountLocked": "Cuenta bloqueada temporalmente por múltiples intentos fallidos. Inténtalo de nuevo en 10 minutos.",
    "message.confirmDelete": "¿Estás seguro de que deseas eliminar este evento?",
    
    // My Tickets
    "myTickets.title": "Mis Entradas",
    "myTickets.subtitle": "Gestiona todas tus entradas compradas",
    "myTickets.noTickets": "No tienes entradas compradas",
    "myTickets.confirmationCode": "Código de confirmación",
    "myTickets.purchaseDate": "Fecha de compra",
    "myTickets.viewDetails": "Ver Detalles",
    "myTickets.noTicketsYet": "No tienes tickets comprados aún",
    "myTickets.viewEvents": "Ver Eventos",
    "myTickets.confirmed": "Confirmado",
    "myTickets.quantity": "Cantidad",
    "myTickets.ticket": "entrada",
    "myTickets.tickets": "entradas",
    "myTickets.presentCode": "Presenta este código en el evento",
    "myTickets.downloadPrint": "Descargar / Imprimir",
    "myTickets.errorLoading": "Error al cargar tus tickets",
    "myTickets.event": "Evento",
    
    // Event List
    "eventList.discover": "Descubre Eventos",
    "eventList.findAndBuy": "Encuentra y compra entradas para los mejores eventos",
    "eventList.searchPlaceholder": "Buscar eventos o ubicaciones...",
    "eventList.category": "Categoría",
    "eventList.allCategories": "Todas las categorías",
    "eventList.noEventsFound": "No se encontraron eventos",
    
    // Event Card
    "eventCard.availableTickets": "entradas disponibles",
    "eventCard.from": "Desde",
    "eventCard.viewDetails": "Ver Detalles",
    
    // Event Details Extended
    "eventDetails.backToEvents": "Volver a eventos",
    "eventDetails.organizedBy": "Organizado por",
    "eventDetails.availability": "Disponibilidad",
    "eventDetails.aboutEvent": "Acerca del evento",
    "eventDetails.buyTickets": "Comprar Entradas",
    "eventDetails.pricePerTicket": "Precio por entrada",
    "eventDetails.digitalTicketInfo": "Recibirás tu entrada digital con código QR por email inmediatamente después de la compra.",
    "eventDetails.buyNow": "Comprar Ahora",
    "eventDetails.instantDelivery": "Entrega instantánea",
    "eventDetails.secureQR": "Código QR seguro",
    "eventDetails.support247": "Soporte 24/7",
    
    // Purchase Flow Extended
    "purchaseFlow.back": "Volver",
    "purchaseFlow.purchaseInfo": "Información de Compra",
    "purchaseFlow.buyerData": "Datos del Comprador",
    "purchaseFlow.fullNamePlaceholder": "Juan Pérez",
    "purchaseFlow.emailPlaceholder": "juan@ejemplo.com",
    "purchaseFlow.emailHelper": "Recibirás tus entradas en este email",
    "purchaseFlow.phone": "Teléfono",
    "purchaseFlow.phonePlaceholder": "+54 11 1234-5678",
    "purchaseFlow.paymentMethod": "Método de Pago",
    "purchaseFlow.cardNumber": "Número de tarjeta",
    "purchaseFlow.cardPlaceholder": "1234 5678 9012 3456",
    "purchaseFlow.expiry": "Vencimiento",
    "purchaseFlow.expiryPlaceholder": "MM/AA",
    "purchaseFlow.cvv": "CVV",
    "purchaseFlow.cvvPlaceholder": "123",
    "purchaseFlow.completePurchase": "Completar Compra",
    "purchaseFlow.purchaseSummary": "Resumen de Compra",
    "purchaseFlow.event": "Evento",
    "purchaseFlow.dateAndTime": "Fecha y hora",
    "purchaseFlow.ticketQuantity": "Cantidad de entradas",
    "purchaseFlow.ticket": "entrada",
    "purchaseFlow.tickets": "entradas",
    "purchaseFlow.subtotal": "Subtotal",
    "purchaseFlow.serviceFee": "Cargo por servicio",
    "purchaseFlow.instantDeliveryInfo": "Entrega instantánea por email con código QR",
    
    // Ticket Confirmation Extended
    "ticketConfirmation.title": "¡Compra Confirmada!",
    "ticketConfirmation.emailSent": "Hemos enviado tus entradas a",
    "ticketConfirmation.purchaseDetails": "Detalles de tu Compra",
    "ticketConfirmation.purchaseDate": "Fecha de compra",
    "ticketConfirmation.holderName": "Nombre del titular",
    "ticketConfirmation.totalPaid": "Total pagado",
    "ticketConfirmation.yourQR": "Tu Código QR",
    "ticketConfirmation.presentQR": "Presenta este código QR en la entrada del evento",
    "ticketConfirmation.importantSave": "Importante: Guarda este código QR en tu dispositivo móvil o imprímelo. Lo necesitarás para ingresar al evento.",
    "ticketConfirmation.downloadPDF": "Descargar PDF",
    "ticketConfirmation.print": "Imprimir",
    "ticketConfirmation.resendEmail": "Reenviar Email",
    "ticketConfirmation.alertPDF": "En una aplicación real, aquí se descargaría el PDF con tus entradas",
  },
  en: {
    // Header
    "header.home": "Home",
    "header.dashboard": "Dashboard",
    "header.myTickets": "My Tickets",
    "header.login": "Login",
    "header.signup": "Sign Up",
    "header.logout": "Logout",
    
    // Home
    "home.title": "Upcoming Events",
    "home.subtitle": "Discover the best events near you",
    "home.search": "Search events...",
    "home.allCategories": "All categories",
    "home.noEvents": "No events available",
    
    // Event Details
    "event.date": "Date",
    "event.time": "Time",
    "event.location": "Location",
    "event.price": "Price",
    "event.available": "Available",
    "event.organizer": "Organizer",
    "event.buyTickets": "Buy Tickets",
    "event.back": "Back",
    "event.soldOut": "Sold Out",
    
    // Purchase Flow
    "purchase.title": "Buy Tickets",
    "purchase.quantity": "Quantity",
    "purchase.name": "Full name",
    "purchase.email": "Email",
    "purchase.total": "Total",
    "purchase.continue": "Continue",
    "purchase.cancel": "Cancel",
    "purchase.processing": "Processing purchase...",
    
    // Confirmation
    "confirmation.title": "Purchase Confirmed!",
    "confirmation.subtitle": "Your purchase has been processed successfully",
    "confirmation.code": "Confirmation code",
    "confirmation.tickets": "tickets",
    "confirmation.download": "Download PDF",
    "confirmation.backToEvents": "Back to Events",
    
    // Organizer Dashboard
    "dashboard.title": "Organizer Dashboard",
    "dashboard.subtitle": "Manage your events and monitor sales",
    "dashboard.createEvent": "Create Event",
    "dashboard.totalRevenue": "Total Revenue",
    "dashboard.ticketsSold": "Tickets Sold",
    "dashboard.activeEvents": "Active Events",
    "dashboard.conversionRate": "Conversion Rate",
    "dashboard.myEvents": "My Events",
    "dashboard.sales": "Sales",
    "dashboard.publishedEvents": "Published Events",
    "dashboard.salesHistory": "Sales History",
    "dashboard.event": "Event",
    "dashboard.status": "Status",
    "dashboard.soldTotal": "Sold / Total",
    "dashboard.revenue": "Revenue",
    "dashboard.active": "Active",
    "dashboard.finished": "Finished",
    "dashboard.edit": "Edit",
    "dashboard.delete": "Delete",
    "dashboard.buyer": "Buyer",
    "dashboard.quantity": "Quantity",
    "dashboard.confirmed": "Confirmed",
    "dashboard.vsLastMonth": "vs last month",
    "dashboard.totalEvents": "total events",
    "dashboard.ofCapacity": "of capacity",
    "dashboard.noTicketsSold": "No sales yet",
    "dashboard.noEvents": "No events",
    
    // Create/Edit Event
    "createEvent.title": "Create New Event",
    "createEvent.editTitle": "Edit Event",
    "createEvent.subtitle": "Fill in your event information to start selling tickets",
    "createEvent.backToDashboard": "Back to dashboard",
    "createEvent.basicInfo": "Basic Information",
    "createEvent.eventName": "Event name",
    "createEvent.description": "Description",
    "createEvent.category": "Category",
    "createEvent.selectCategory": "Select a category",
    "createEvent.dateLocation": "Date and Location",
    "createEvent.date": "Date",
    "createEvent.time": "Time",
    "createEvent.timeHelper": "Local time (will be converted to UTC)",
    "createEvent.location": "Location",
    "createEvent.ticketsPricing": "Tickets and Pricing",
    "createEvent.pricePerTicket": "Price per ticket",
    "createEvent.ticketQuantity": "Number of tickets",
    "createEvent.eventImage": "Event Image",
    "createEvent.imageUrl": "Image URL",
    "createEvent.imageHelper": "Provide a URL for your event image (optional)",
    "createEvent.cancel": "Cancel",
    "createEvent.publish": "Publish Event",
    "createEvent.update": "Update Event",
    "createEvent.required": "*",
    
    // Categories
    "category.music": "Music",
    "category.sports": "Sports",
    "category.theater": "Theater",
    "category.conferences": "Conferences",
    "category.festivals": "Festivals",
    "category.other": "Other",
    
    // Auth
    "auth.login": "Login",
    "auth.loginSubtitle": "Enter your credentials to access your account",
    "auth.signup": "Sign Up",
    "auth.signupSubtitle": "Join ProTicket and start enjoying amazing events",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.fullName": "Full name",
    "auth.accountType": "Account type",
    "auth.buyer": "Buyer",
    "auth.buyerDesc": "Purchase tickets for events",
    "auth.organizer": "Organizer",
    "auth.organizerDesc": "Create and manage events",
    "auth.hasAccount": "Already have an account?",
    "auth.noAccount": "Don't have an account?",
    "auth.loginHere": "Login here",
    "auth.signupHere": "Sign up here",
    "auth.forgotPassword": "Forgot your password?",
    "auth.resetPassword": "Reset Password",
    "auth.resetSubtitle": "Enter your email to receive instructions",
    "auth.sendResetLink": "Send reset link",
    "auth.backToLogin": "Back to login",
    "auth.passwordRules": "Minimum 8 characters, one uppercase, one lowercase, and one number",
    "auth.loggingIn": "Logging in...",
    "auth.creatingAccount": "Creating account...",
    "auth.sending": "Sending...",
    
    // Messages
    "message.loginRequired": "You must login to buy tickets",
    "message.buyersOnly": "Only buyers can purchase tickets",
    "message.organizersOnly": "Only organizers can access the dashboard",
    "message.buyersCanViewTickets": "Only buyers can view their tickets",
    "message.purchaseSuccess": "Purchase completed successfully!",
    "message.eventCreated": "Event created successfully",
    "message.eventUpdated": "Event updated successfully",
    "message.eventDeleted": "Event deleted successfully",
    "message.welcomeBack": "Welcome back!",
    "message.accountCreated": "Account created successfully!",
    "message.resetLinkSent": "Reset link sent to your email",
    "message.accountLocked": "Account temporarily locked due to multiple failed attempts. Please try again in 10 minutes.",
    "message.confirmDelete": "Are you sure you want to delete this event?",
    
    // My Tickets
    "myTickets.title": "My Tickets",
    "myTickets.subtitle": "Manage all your purchased tickets",
    "myTickets.noTickets": "You don't have any purchased tickets",
    "myTickets.confirmationCode": "Confirmation code",
    "myTickets.purchaseDate": "Purchase date",
    "myTickets.viewDetails": "View Details",
    "myTickets.noTicketsYet": "You don't have any purchased tickets yet",
    "myTickets.viewEvents": "View Events",
    "myTickets.confirmed": "Confirmed",
    "myTickets.quantity": "Quantity",
    "myTickets.ticket": "ticket",
    "myTickets.tickets": "tickets",
    "myTickets.presentCode": "Present this code at the event",
    "myTickets.downloadPrint": "Download / Print",
    "myTickets.errorLoading": "Error loading your tickets",
    "myTickets.event": "Event",
    
    // Event List
    "eventList.discover": "Discover Events",
    "eventList.findAndBuy": "Find and buy tickets for the best events",
    "eventList.searchPlaceholder": "Search events or locations...",
    "eventList.category": "Category",
    "eventList.allCategories": "All categories",
    "eventList.noEventsFound": "No events found",
    
    // Event Card
    "eventCard.availableTickets": "tickets available",
    "eventCard.from": "From",
    "eventCard.viewDetails": "View Details",
    
    // Event Details Extended
    "eventDetails.backToEvents": "Back to events",
    "eventDetails.organizedBy": "Organized by",
    "eventDetails.availability": "Availability",
    "eventDetails.aboutEvent": "About the event",
    "eventDetails.buyTickets": "Buy Tickets",
    "eventDetails.pricePerTicket": "Price per ticket",
    "eventDetails.digitalTicketInfo": "You will receive your digital ticket with QR code by email immediately after purchase.",
    "eventDetails.buyNow": "Buy Now",
    "eventDetails.instantDelivery": "Instant delivery",
    "eventDetails.secureQR": "Secure QR code",
    "eventDetails.support247": "24/7 Support",
    
    // Purchase Flow Extended
    "purchaseFlow.back": "Back",
    "purchaseFlow.purchaseInfo": "Purchase Information",
    "purchaseFlow.buyerData": "Buyer Information",
    "purchaseFlow.fullNamePlaceholder": "John Doe",
    "purchaseFlow.emailPlaceholder": "john@example.com",
    "purchaseFlow.emailHelper": "You will receive your tickets at this email",
    "purchaseFlow.phone": "Phone",
    "purchaseFlow.phonePlaceholder": "+1 234 567-8900",
    "purchaseFlow.paymentMethod": "Payment Method",
    "purchaseFlow.cardNumber": "Card number",
    "purchaseFlow.cardPlaceholder": "1234 5678 9012 3456",
    "purchaseFlow.expiry": "Expiration",
    "purchaseFlow.expiryPlaceholder": "MM/YY",
    "purchaseFlow.cvv": "CVV",
    "purchaseFlow.cvvPlaceholder": "123",
    "purchaseFlow.completePurchase": "Complete Purchase",
    "purchaseFlow.purchaseSummary": "Purchase Summary",
    "purchaseFlow.event": "Event",
    "purchaseFlow.dateAndTime": "Date and time",
    "purchaseFlow.ticketQuantity": "Number of tickets",
    "purchaseFlow.ticket": "ticket",
    "purchaseFlow.tickets": "tickets",
    "purchaseFlow.subtotal": "Subtotal",
    "purchaseFlow.serviceFee": "Service fee",
    "purchaseFlow.instantDeliveryInfo": "Instant delivery by email with QR code",
    
    // Ticket Confirmation Extended
    "ticketConfirmation.title": "Purchase Confirmed!",
    "ticketConfirmation.emailSent": "We have sent your tickets to",
    "ticketConfirmation.purchaseDetails": "Purchase Details",
    "ticketConfirmation.purchaseDate": "Purchase date",
    "ticketConfirmation.holderName": "Holder name",
    "ticketConfirmation.totalPaid": "Total paid",
    "ticketConfirmation.yourQR": "Your QR Code",
    "ticketConfirmation.presentQR": "Present this QR code at the event entrance",
    "ticketConfirmation.importantSave": "Important: Save this QR code on your mobile device or print it. You will need it to enter the event.",
    "ticketConfirmation.downloadPDF": "Download PDF",
    "ticketConfirmation.print": "Print",
    "ticketConfirmation.resendEmail": "Resend Email",
    "ticketConfirmation.alertPDF": "In a real application, the PDF with your tickets would be downloaded here",
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("proticket-language");
    return (saved === "en" || saved === "es" ? saved : "es") as Language;
  });

  useEffect(() => {
    localStorage.setItem("proticket-language", language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  // Format date from date string (YYYY-MM-DD) and optional time (HH:MM)
  const formatDate = (dateString: string, timeString?: string): string => {
    try {
      const date = new Date(dateString);
      
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
      };

      if (timeString) {
        options.hour = "2-digit";
        options.minute = "2-digit";
        const [hours, minutes] = timeString.split(":");
        date.setHours(parseInt(hours), parseInt(minutes));
      }

      return date.toLocaleDateString(language === "es" ? "es-ES" : "en-US", options);
    } catch (error) {
      return dateString;
    }
  };

  // Format date/time from ISO string (stored in UTC)
  const formatDateTime = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };

      return date.toLocaleDateString(language === "es" ? "es-ES" : "en-US", options);
    } catch (error) {
      return isoString;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, formatDate, formatDateTime }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
