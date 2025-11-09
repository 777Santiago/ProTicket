import { useState } from "react";
import { Plus, TrendingUp, Users, Ticket, DollarSign, Calendar, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { useLanguage } from "../contexts/LanguageContext";

interface OrganizerDashboardProps {
  events: Array<{
    id: string;
    title: string;
    date: string;
    status: string;
    ticketsSold: number;
    totalTickets: number;
    revenue: number;
  }>;
  onCreateEvent: () => void;
  onEditEvent: (eventId: string) => void;
  onDeleteEvent: (eventId: string) => void;
}

export function OrganizerDashboard({ events, onCreateEvent, onEditEvent, onDeleteEvent }: OrganizerDashboardProps) {
  const { t } = useLanguage();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const totalRevenue = events.reduce((sum, event) => sum + event.revenue, 0);
  const totalTicketsSold = events.reduce((sum, event) => sum + event.ticketsSold, 0);
  const activeEvents = events.filter(e => e.status === "active").length;

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="mb-2">{t("dashboard.title")}</h1>
          <p className="text-gray-600">{t("dashboard.subtitle")}</p>
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
            <div className="text-2xl">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-gray-600 mt-1">
              <span className="text-green-600">+12.5%</span> {t("dashboard.vsLastMonth")}
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
              <span className="text-green-600">+8.2%</span> {t("dashboard.vsLastMonth")}
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
            <div className="text-2xl">68%</div>
            <p className="text-xs text-gray-600 mt-1">
              <span className="text-green-600">+3.1%</span> {t("dashboard.vsLastMonth")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="events" className="space-y-6">
        <TabsList>
          <TabsTrigger value="events">{t("dashboard.myEvents")}</TabsTrigger>
          <TabsTrigger value="sales">{t("dashboard.sales")}</TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.publishedEvents")}</CardTitle>
            </CardHeader>
            <CardContent>
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
                            style={{ width: `${(event.ticketsSold / event.totalTickets) * 100}%` }}
                          />
                        </div>
                      </TableCell>
                      <TableCell>${event.revenue.toLocaleString()}</TableCell>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.salesHistory")}</CardTitle>
            </CardHeader>
            <CardContent>
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
                  <TableRow>
                    <TableCell>18/10/2025</TableCell>
                    <TableCell>Festival de Rock 2025</TableCell>
                    <TableCell>María González</TableCell>
                    <TableCell>2 entradas</TableCell>
                    <TableCell>$15,000</TableCell>
                    <TableCell>
                      <Badge variant="default">{t("dashboard.confirmed")}</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>18/10/2025</TableCell>
                    <TableCell>Tech Summit 2025</TableCell>
                    <TableCell>Carlos Rodríguez</TableCell>
                    <TableCell>1 entrada</TableCell>
                    <TableCell>$8,500</TableCell>
                    <TableCell>
                      <Badge variant="default">{t("dashboard.confirmed")}</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>17/10/2025</TableCell>
                    <TableCell>Festival de Rock 2025</TableCell>
                    <TableCell>Ana Martínez</TableCell>
                    <TableCell>4 entradas</TableCell>
                    <TableCell>$30,000</TableCell>
                    <TableCell>
                      <Badge variant="default">{t("dashboard.confirmed")}</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
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
