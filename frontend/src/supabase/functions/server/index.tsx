import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use("*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));
app.use("*", logger(console.log));

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

console.log("=== ProTicket Server Starting ===");
console.log("Supabase URL:", Deno.env.get('SUPABASE_URL')?.substring(0, 30) + "...");
console.log("Server initialized at:", new Date().toISOString());

// Seed initial events on startup
async function seedInitialEvents() {
  const existingEvents = await kv.getByPrefix("event:");
  if (existingEvents && existingEvents.length > 0) {
    console.log("Events already seeded");
    return;
  }

  const initialEvents = [
    {
      id: "seed-1",
      title: "Festival de Rock 2025",
      date: "15 de Noviembre, 2025",
      time: "18:00",
      location: "Estadio River Plate, Buenos Aires",
      price: 7500,
      category: "Música",
      image: "https://images.unsplash.com/photo-1604364260242-1156640c0dfb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwY3Jvd2QlMjBsaXZlJTIwbXVzaWN8ZW58MXx8fHwxNzYwODIyOTU3fDA&ixlib=rb-4.1.0&q=80&w=1080",
      availableTickets: 450,
      totalTickets: 500,
      description: "El festival de rock más esperado del año con las mejores bandas nacionales e internacionales. Una experiencia única con más de 12 horas de música en vivo, food trucks gourmet y una producción de primer nivel.",
      organizerName: "Rock Producciones",
      organizerId: "seed-organizer",
      status: "active",
      ticketsSold: 50,
      revenue: 375000,
      createdAt: new Date().toISOString(),
    },
    {
      id: "seed-2",
      title: "Tech Summit 2025",
      date: "22 de Noviembre, 2025",
      time: "09:00",
      location: "Centro de Convenciones, CABA",
      price: 8500,
      category: "Conferencias",
      image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25mZXJlbmNlJTIwYnVzaW5lc3MlMjBldmVudHxlbnwxfHx8fDE3NjA3ODIxNzl8MA&ixlib=rb-4.1.0&q=80&w=1080",
      availableTickets: 280,
      totalTickets: 300,
      description: "La conferencia de tecnología más importante de América Latina. Speakers internacionales, workshops prácticos, networking y las últimas tendencias en IA, desarrollo web y startups. Incluye coffee break y almuerzo.",
      organizerName: "TechEvents SA",
      organizerId: "seed-organizer",
      status: "active",
      ticketsSold: 20,
      revenue: 170000,
      createdAt: new Date().toISOString(),
    },
    {
      id: "seed-3",
      title: "Partido Clásico - Boca vs River",
      date: "5 de Diciembre, 2025",
      time: "21:00",
      location: "La Bombonera, Buenos Aires",
      price: 12000,
      category: "Deportes",
      image: "https://images.unsplash.com/photo-1760508737418-a7add7ee3871?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBzdGFkaXVtJTIwZXZlbnR8ZW58MXx8fHwxNzYwODAxMTMzfDA&ixlib=rb-4.1.0&q=80&w=1080",
      availableTickets: 150,
      totalTickets: 200,
      description: "El clásico más apasionante del fútbol argentino. Vive la emoción del superclásico desde las mejores ubicaciones. Entrada general incluye acceso 2 horas antes del partido para disfrutar del ambiente único de La Bombonera.",
      organizerName: "Club Atlético Boca Juniors",
      organizerId: "seed-organizer",
      status: "active",
      ticketsSold: 50,
      revenue: 600000,
      createdAt: new Date().toISOString(),
    },
    {
      id: "seed-4",
      title: "Hamilton - Musical en Broadway BA",
      date: "10 de Diciembre, 2025",
      time: "20:30",
      location: "Teatro Colón, Buenos Aires",
      price: 15000,
      category: "Teatro",
      image: "https://images.unsplash.com/photo-1539964604210-db87088e0c2c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdGVyJTIwcGVyZm9ybWFuY2UlMjBzdGFnZXxlbnwxfHx8fDE3NjA4MjI5NTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
      availableTickets: 320,
      totalTickets: 350,
      description: "El musical ganador del Premio Tony llega a Buenos Aires. Una producción espectacular que cuenta la historia de Alexander Hamilton con música hip-hop y performances inolvidables. Duración: 2 horas 45 minutos con intermedio.",
      organizerName: "Broadway Argentina",
      organizerId: "seed-organizer",
      status: "active",
      ticketsSold: 30,
      revenue: 450000,
      createdAt: new Date().toISOString(),
    },
  ];

  for (const event of initialEvents) {
    await kv.set(`event:${event.id}`, event);
  }

  console.log("Initial events seeded successfully");
}

// Seed events on startup
seedInitialEvents();

// Health check endpoint
app.get("/make-server-45ce65c6/health", (c) => {
  console.log("Health check called");
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    server: "ProTicket API",
    version: "1.0.0"
  });
});

// Root endpoint for testing
app.get("/make-server-45ce65c6/", (c) => {
  console.log("Root endpoint called");
  return c.json({
    message: "ProTicket API is running",
    endpoints: [
      "GET /health",
      "GET /events",
      "POST /auth/signup",
      "GET /auth/profile"
    ]
  });
});

// Helper function to validate password strength
function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters long" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: "Password must contain at least one uppercase letter" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: "Password must contain at least one lowercase letter" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: "Password must contain at least one number" };
  }
  return { valid: true };
}

// Helper function to check and update login attempts
async function checkLoginAttempts(email: string): Promise<{ allowed: boolean; remainingTime?: number }> {
  const attemptsKey = `login_attempts:${email}`;
  const attempts = await kv.get(attemptsKey) || { count: 0, lockedUntil: null };

  // Check if account is locked
  if (attempts.lockedUntil && new Date(attempts.lockedUntil) > new Date()) {
    const remainingMs = new Date(attempts.lockedUntil).getTime() - new Date().getTime();
    const remainingMinutes = Math.ceil(remainingMs / 60000);
    return { allowed: false, remainingTime: remainingMinutes };
  }

  // Reset if lock expired
  if (attempts.lockedUntil && new Date(attempts.lockedUntil) <= new Date()) {
    await kv.set(attemptsKey, { count: 0, lockedUntil: null });
  }

  return { allowed: true };
}

async function recordFailedLogin(email: string) {
  const attemptsKey = `login_attempts:${email}`;
  const attempts = await kv.get(attemptsKey) || { count: 0, lockedUntil: null };

  attempts.count += 1;

  // Lock account after 5 failed attempts
  if (attempts.count >= 5) {
    const lockUntil = new Date();
    lockUntil.setMinutes(lockUntil.getMinutes() + 10);
    attempts.lockedUntil = lockUntil.toISOString();
  }

  await kv.set(attemptsKey, attempts);
}

async function resetLoginAttempts(email: string) {
  const attemptsKey = `login_attempts:${email}`;
  await kv.set(attemptsKey, { count: 0, lockedUntil: null });
}

// Check login attempts endpoint
app.post("/make-server-45ce65c6/auth/check-login", async (c) => {
  try {
    const { email } = await c.req.json();
    const result = await checkLoginAttempts(email);
    return c.json(result);
  } catch (error) {
    console.log(`Check login attempts error: ${error}`);
    return c.json({ error: "Error checking login attempts" }, 500);
  }
});

// Record failed login endpoint (called from frontend after failed Supabase auth)
app.post("/make-server-45ce65c6/auth/failed-login", async (c) => {
  try {
    const { email } = await c.req.json();
    await recordFailedLogin(email);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Record failed login error: ${error}`);
    return c.json({ error: "Error recording failed login" }, 500);
  }
});

// Reset login attempts endpoint (called after successful login)
app.post("/make-server-45ce65c6/auth/reset-attempts", async (c) => {
  try {
    const { email } = await c.req.json();
    await resetLoginAttempts(email);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Reset login attempts error: ${error}`);
    return c.json({ error: "Error resetting login attempts" }, 500);
  }
});

// Signup route - crear nuevo usuario
app.post("/make-server-45ce65c6/auth/signup", async (c) => {
  try {
    const { email, password, name, role } = await c.req.json();

    if (!email || !password || !name || !role) {
      return c.json({ error: "Email, contraseña, nombre y rol son requeridos" }, 400);
    }

    if (!['buyer', 'organizer'].includes(role)) {
      return c.json({ error: "Rol inválido. Debe ser 'buyer' o 'organizer'" }, 400);
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return c.json({ error: passwordValidation.error }, 400);
    }

    // Crear usuario con Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        name,
        role,
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Error creating user: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Guardar perfil adicional en KV store
    await kv.set(`user_profile:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      role,
      createdAt: new Date().toISOString(),
    });

    console.log(`User created successfully: ${email} with role ${role}`);

    return c.json({
      message: "Usuario creado exitosamente",
      user: {
        id: data.user.id,
        email: data.user.email,
        name,
        role,
      }
    });
  } catch (error) {
    console.log(`Signup error: ${error}`);
    return c.json({ error: "Error al crear usuario" }, 500);
  }
});

// Get user profile
app.get("/make-server-45ce65c6/auth/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];

    if (!accessToken) {
      return c.json({ error: "Token no proporcionado" }, 401);
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);

    if (error || !user) {
      console.log(`Error getting user profile: ${error?.message}`);
      return c.json({ error: "No autorizado" }, 401);
    }

    const profile = await kv.get(`user_profile:${user.id}`);

    return c.json({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || profile?.name || "",
      role: user.user_metadata?.role || profile?.role || "buyer",
    });
  } catch (error) {
    console.log(`Profile error: ${error}`);
    return c.json({ error: "Error al obtener perfil" }, 500);
  }
});

// Get user profile by ID (para mostrar info en dashboard de organizador)
app.get("/make-server-45ce65c6/auth/user-profile/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');

    console.log(`📊 Obteniendo perfil del usuario: ${userId}`);

    if (!userId) {
      return c.json({ error: "User ID requerido" }, 400);
    }

    // Buscar perfil en KV store
    const profile = await kv.get(`user_profile:${userId}`);

    if (!profile) {
      console.log(`❌ Perfil no encontrado para: ${userId}`);
      return c.json({ error: "Usuario no encontrado" }, 404);
    }

    console.log(`✅ Perfil encontrado: ${profile.name} (${profile.email})`);

    // Retornar información pública
    return c.json({
      id: profile.id,
      name: profile.name || profile.email?.split('@')[0] || "Usuario",
      email: profile.email || "",
      role: profile.role || "buyer",
    });
  } catch (error) {
    console.log(`❌ Error obteniendo perfil: ${error}`);
    return c.json({ error: "Error al obtener usuario" }, 500);
  }
});

// Get user profile by ID (para mostrar info de compradores)
app.get("/make-server-45ce65c6/auth/user/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');

    if (!userId) {
      return c.json({ error: "User ID requerido" }, 400);
    }

    // Buscar perfil en KV store
    const profile = await kv.get(`user_profile:${userId}`);

    if (!profile) {
      return c.json({ error: "Usuario no encontrado" }, 404);
    }

    // Retornar solo información pública (sin datos sensibles)
    return c.json({
      id: profile.id,
      name: profile.name || "Usuario",
      role: profile.role || "buyer",
    });
  } catch (error) {
    console.log(`Get user by ID error: ${error}`);
    return c.json({ error: "Error al obtener usuario" }, 500);
  }
});

// Create event (organizers only)
app.post("/make-server-45ce65c6/events", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];

    if (!accessToken) {
      return c.json({ error: "No autorizado" }, 401);
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: "No autorizado" }, 401);
    }

    const profile = await kv.get(`user_profile:${user.id}`);

    if (profile?.role !== 'organizer') {
      return c.json({ error: "Solo los organizadores pueden crear eventos" }, 403);
    }

    const eventData = await c.req.json();
    const eventId = Math.random().toString(36).substring(7);

    const event = {
      id: eventId,
      ...eventData,
      organizerId: user.id,
      organizerName: profile.name,
      status: "active",
      ticketsSold: 0,
      revenue: 0,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`event:${eventId}`, event);

    // Add to organizer's events list
    const organizerEvents = await kv.get(`organizer_events:${user.id}`) || [];
    organizerEvents.push(eventId);
    await kv.set(`organizer_events:${user.id}`, organizerEvents);

    console.log(`Event created: ${eventId} by ${user.id}`);

    return c.json({ event });
  } catch (error) {
    console.log(`Create event error: ${error}`);
    return c.json({ error: "Error al crear evento" }, 500);
  }
});

// Get all events (public)
app.get("/make-server-45ce65c6/events", async (c) => {
  try {
    console.log("GET /events - Fetching all events");
    const events = await kv.getByPrefix("event:");
    console.log(`GET /events - Found ${events?.length || 0} events`);
    return c.json({ events: events || [] });
  } catch (error) {
    console.log(`Get events error: ${error}`);
    return c.json({ error: "Error al obtener eventos" }, 500);
  }
});

// Get organizer's events
app.get("/make-server-45ce65c6/events/my-events", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];

    if (!accessToken) {
      return c.json({ error: "No autorizado" }, 401);
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: "No autorizado" }, 401);
    }

    const eventIds = await kv.get(`organizer_events:${user.id}`) || [];
    const events = await Promise.all(
      eventIds.map((id: string) => kv.get(`event:${id}`))
    );

    return c.json({ events: events.filter(e => e !== null) });
  } catch (error) {
    console.log(`Get my events error: ${error}`);
    return c.json({ error: "Error al obtener eventos" }, 500);
  }
});

// Purchase ticket
app.post("/make-server-45ce65c6/purchases", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];

    if (!accessToken) {
      return c.json({ error: "No autorizado" }, 401);
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: "No autorizado" }, 401);
    }

    const purchaseData = await c.req.json();
    const { eventId, quantity } = purchaseData;

    const event = await kv.get(`event:${eventId}`);

    if (!event) {
      return c.json({ error: "Evento no encontrado" }, 404);
    }

    if (event.availableTickets < quantity) {
      return c.json({ error: "No hay suficientes entradas disponibles" }, 400);
    }

    const purchaseId = Math.random().toString(36).substring(2, 10).toUpperCase();

    const purchase = {
      id: purchaseId,
      userId: user.id,
      eventId,
      quantity,
      totalPrice: event.price * quantity,
      confirmationCode: purchaseId,
      purchaseDate: new Date().toISOString(),
      status: "confirmed",
      ...purchaseData,
    };

    // Update event tickets
    event.availableTickets -= quantity;
    event.ticketsSold += quantity;
    event.revenue += purchase.totalPrice;
    await kv.set(`event:${eventId}`, event);

    // Save purchase
    await kv.set(`purchase:${purchaseId}`, purchase);

    // Add to user's purchases
    const userPurchases = await kv.get(`user_purchases:${user.id}`) || [];
    userPurchases.push(purchaseId);
    await kv.set(`user_purchases:${user.id}`, userPurchases);

    console.log(`Purchase created: ${purchaseId} by ${user.id}`);

    return c.json({ purchase });
  } catch (error) {
    console.log(`Purchase error: ${error}`);
    return c.json({ error: "Error al procesar compra" }, 500);
  }
});

// Get user's purchases
app.get("/make-server-45ce65c6/purchases/my-tickets", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];

    if (!accessToken) {
      return c.json({ error: "No autorizado" }, 401);
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: "No autorizado" }, 401);
    }

    const purchaseIds = await kv.get(`user_purchases:${user.id}`) || [];
    const purchases = await Promise.all(
      purchaseIds.map((id: string) => kv.get(`purchase:${id}`))
    );

    return c.json({ purchases: purchases.filter(p => p !== null) });
  } catch (error) {
    console.log(`Get my tickets error: ${error}`);
    return c.json({ error: "Error al obtener tickets" }, 500);
  }
});

// Update event (organizers only)
app.put("/make-server-45ce65c6/events/:eventId", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];

    if (!accessToken) {
      return c.json({ error: "No autorizado" }, 401);
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: "No autorizado" }, 401);
    }

    const profile = await kv.get(`user_profile:${user.id}`);

    if (profile?.role !== 'organizer') {
      return c.json({ error: "Solo los organizadores pueden editar eventos" }, 403);
    }

    const eventId = c.req.param('eventId');
    const event = await kv.get(`event:${eventId}`);

    if (!event) {
      return c.json({ error: "Evento no encontrado" }, 404);
    }

    // Check if user owns this event
    if (event.organizerId !== user.id) {
      return c.json({ error: "No tienes permiso para editar este evento" }, 403);
    }

    const updateData = await c.req.json();

    // Preserve certain fields that shouldn't be changed
    const updatedEvent = {
      ...event,
      ...updateData,
      id: event.id,
      organizerId: event.organizerId,
      organizerName: event.organizerName,
      ticketsSold: event.ticketsSold,
      revenue: event.revenue,
      createdAt: event.createdAt,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`event:${eventId}`, updatedEvent);

    console.log(`Event updated: ${eventId} by ${user.id}`);

    return c.json({ event: updatedEvent });
  } catch (error) {
    console.log(`Update event error: ${error}`);
    return c.json({ error: "Error al actualizar evento" }, 500);
  }
});

// Delete event (organizers only)
app.delete("/make-server-45ce65c6/events/:eventId", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];

    if (!accessToken) {
      return c.json({ error: "No autorizado" }, 401);
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: "No autorizado" }, 401);
    }

    const profile = await kv.get(`user_profile:${user.id}`);

    if (profile?.role !== 'organizer') {
      return c.json({ error: "Solo los organizadores pueden eliminar eventos" }, 403);
    }

    const eventId = c.req.param('eventId');
    const event = await kv.get(`event:${eventId}`);

    if (!event) {
      return c.json({ error: "Evento no encontrado" }, 404);
    }

    // Check if user owns this event
    if (event.organizerId !== user.id) {
      return c.json({ error: "No tienes permiso para eliminar este evento" }, 403);
    }

    // Check if event has sales
    if (event.ticketsSold > 0) {
      return c.json({ error: "No puedes eliminar un evento con ventas realizadas" }, 400);
    }

    // Delete event
    await kv.del(`event:${eventId}`);

    // Remove from organizer's events list
    const organizerEvents = await kv.get(`organizer_events:${user.id}`) || [];
    const updatedEvents = organizerEvents.filter((id: string) => id !== eventId);
    await kv.set(`organizer_events:${user.id}`, updatedEvents);

    console.log(`Event deleted: ${eventId} by ${user.id}`);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Delete event error: ${error}`);
    return c.json({ error: "Error al eliminar evento" }, 500);
  }
});

// Global error handler
app.onError((err, c) => {
  console.error("Global error handler:", err);
  return c.json({
    error: "Internal server error",
    message: err.message,
    timestamp: new Date().toISOString()
  }, 500);
});

// Password reset request
app.post("/make-server-45ce65c6/auth/reset-password-request", async (c) => {
  try {
    const { email } = await c.req.json();

    if (!email) {
      return c.json({ error: "Email es requerido" }, 400);
    }

    // Generate reset link using Supabase Auth
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email);

    if (error) {
      // Don't reveal if email exists or not for security
      console.log(`Password reset error: ${error.message}`);
    }

    // Always return success to prevent email enumeration
    return c.json({
      message: "Si el email existe, recibirás instrucciones para restablecer tu contraseña"
    });
  } catch (error) {
    console.log(`Password reset request error: ${error}`);
    return c.json({ error: "Error al procesar solicitud" }, 500);
  }
});

Deno.serve(app.fetch);
