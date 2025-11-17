import { useState, useEffect } from "react";
import { Plus, TrendingUp, Users, Ticket, DollarSign, Calendar, MoreVertical, Edit, Trash2, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { ordersService } from "../services/orders.service";
import { toast } from "sonner@2.0.3";

interface OrganizerDashboardProps {
  events: Array<{
    id: string;
    title: string;
    date: string;
    status: string;
    ticketsSold: number;
    totalTickets: number;
    revenue: number;
    conversionRate?: number;
  }>;
  onCreateEvent: () => void;
  onEditEvent: (eventId: string) => void;
  onDeleteEvent: (eventId: string) => void;
}

interface Sale {
  id: number;
  date: string;
  eventTitle: string;
  buyerId: string;
  buyerName: string;  // NUEVO
  quantity: number;
  totalPrice: number;
  status: string;
}

export function OrganizerDashboard({ events, onCreateEvent, onEditEvent, onDeleteEvent }: OrganizerDashboardProps) {
  const { t } = useLanguage();
  const { user, accessToken } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loadingSales, setLoadingSales] = useState(false);

  const totalRevenue = events.reduce((sum, event) => sum + event.revenue, 0);
  const totalTicketsSold = events.reduce((sum, event) => sum + event.ticketsSold, 0);
  const activeEvents = events.filter(e => e.status === "active").length;

  // Calcular tasa de conversión promedio
  const conversionRates = events
    .map(e => e.conversionRate || 0)
    .filter(rate => rate > 0);
  const averageConversionRate = conversionRates.length > 0
    ? conversionRates.reduce((sum, rate) => sum + rate, 0) / conversionRates.length
    : 0;

  // Cargar ventas cuando se monta el componente
  useEffect(() => {
    if (user && accessToken) {
      fetchSales();
    }
  }, [user, accessToken]);

  async function fetchSales() {
    if (!user || !accessToken) return;

    try {
      setLoadingSales(true);
      console.log("📊 Cargando ventas del organizador...");

      const orders = await ordersService.getByOrganizer(user.id, accessToken);
      console.log("✅ Órdenes recibidas:", orders);

      if (orders.length === 0) {
        setSales([]);
        return;
      }

      // Transformar órdenes a formato de ventas usando el buyer_name que viene de la orden
      const salesData: Sale[] = orders.map(order => ({
        id: order.id_order,
        date: new Date(order.created_at).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }),
        eventTitle: order.event_title || "Evento",
        buyerId: order.buyer_id,
        buyerName: order.buyer_name || "Usuario",  // USAR DIRECTAMENTE EL NOMBRE DE LA ORDEN
        quantity: order.quantity,
        totalPrice: order.total_price,
        status: order.status,
      }));

      // Ordenar por fecha más reciente primero
      salesData.sort((a, b) => {
        const dateA = new Date(a.date.split('/').reverse().join('-'));
        const dateB = new Date(b.date.split('/').reverse().join('-'));
        return dateB.getTime() - dateA.getTime();
      });

      console.log("✅ Ventas transformadas con nombres:", salesData);
      setSales(salesData);
    } catch (error: any) {
      console.error("❌ Error cargando ventas:", error);
      toast.error("Error al cargar el historial de ventas");
      setSales([]);
    } finally {
      setLoadingSales(false);
    }
  }

  const handleDeleteClick = (eventId: string) => {
    setEventToDelete(eventId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (eventToDelete) {
      onDeleteEvent(eventToDelete);
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { variant: "default" | "secondary" | "destructive", label: string } } = {
      confirmed: { variant: "default", label: t("dashboard.confirmed") },
      paid: { variant: "default", label: t("dashboard.confirmed") },
      pending: { variant: "secondary", label: "Pendiente" },
      cancelled: { variant: "destructive", label: "Cancelado" },
    };

    const statusInfo = statusMap[status] || { variant: "secondary", label: status };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="mb-2">
            {user?.role === "admin" ? "Panel de Administrador" : t("dashboard.title")}
          </h1>
          <p className="text-gray-600">
            {user?.role === "admin"
              ? "Gestiona todos los eventos de la plataforma"
              : t("dashboard.subtitle")
            }
          </p>
        </div>
        <Button onClick={onCreateEvent} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          {t("dashboard.createEvent")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">{t("dashboard.totalRevenue")}</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">${totalRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-gray-600 mt-1">
              {events.length} {t("dashboard.totalEvents")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">{t("dashboard.ticketsSold")}</CardTitle>
            <Ticket className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalTicketsSold}</div>
            <p className="text-xs text-gray-600 mt-1">
              {totalTicketsSold > 0
                ? `${Math.round((totalTicketsSold / events.reduce((sum, e) => sum + e.totalTickets, 0)) * 100)}% ${t("dashboard.ofCapacity")}`
                : t("dashboard.noTicketsSold")
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">{t("dashboard.activeEvents")}</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{activeEvents}</div>
            <p className="text-xs text-gray-600 mt-1">
              {events.length} {t("dashboard.totalEvents")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">{t("dashboard.conversionRate")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{Math.round(averageConversionRate * 10) / 10}%</div>
            <p className="text-xs text-gray-600 mt-1">
              {events.length > 0
                ? `${events.length} ${t("dashboard.totalEvents")}`
                : t("dashboard.noEvents")
              }
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="events" className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="events">{t("dashboard.myEvents")}</TabsTrigger>
            <TabsTrigger value="sales">{t("dashboard.sales")}</TabsTrigger>
          </TabsList>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchSales();
              // Disparar evento para que App.tsx refresque los eventos
              window.dispatchEvent(new CustomEvent('refreshDashboard'));
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.publishedEvents")}</CardTitle>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {t("dashboard.noEvents")}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("dashboard.event")}</TableHead>
                      <TableHead>{t("event.date")}</TableHead>
                      <TableHead>{t("dashboard.status")}</TableHead>
                      <TableHead>{t("dashboard.soldTotal")}</TableHead>
                      <TableHead>{t("dashboard.revenue")}</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map(event => (
                      <TableRow key={event.id}>
                        <TableCell>{event.title}</TableCell>
                        <TableCell>{event.date}</TableCell>
                        <TableCell>
                          <Badge variant={event.status === "active" ? "default" : "secondary"}>
                            {event.status === "active" ? t("dashboard.active") : t("dashboard.finished")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {event.ticketsSold} / {event.totalTickets}
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${Math.min(100, (event.ticketsSold / event.totalTickets) * 100)}%` }}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          ${event.revenue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" aria-label="Opciones del evento">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onEditEvent(event.id)}>
                                <Edit className="h-4 w-4 mr-2" />
                                {t("dashboard.edit")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteClick(event.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t("dashboard.delete")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.salesHistory")}</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSales ? (
                <div className="text-center py-8 text-gray-500">
                  Cargando ventas...
                </div>
              ) : sales.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {t("dashboard.noTicketsSold")}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("event.date")}</TableHead>
                      <TableHead>{t("dashboard.event")}</TableHead>
                      <TableHead>{t("dashboard.buyer")}</TableHead>
                      <TableHead>{t("dashboard.quantity")}</TableHead>
                      <TableHead>{t("purchase.total")}</TableHead>
                      <TableHead>{t("dashboard.status")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales.map(sale => (
                      <TableRow key={sale.id}>
                        <TableCell>{sale.date}</TableCell>
                        <TableCell>{sale.eventTitle}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{sale.buyerName}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {sale.quantity} {sale.quantity === 1 ? "entrada" : "entradas"}
                        </TableCell>
                        <TableCell className="font-semibold">
                          ${sale.totalPrice.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(sale.status)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dashboard.delete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("message.confirmDelete")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("createEvent.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              {t("dashboard.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}