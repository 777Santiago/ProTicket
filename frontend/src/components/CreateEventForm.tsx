import { useState, useEffect } from "react";
import { ArrowLeft, Upload, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useLanguage } from "../contexts/LanguageContext";

interface CreateEventFormProps {
  onBack: () => void;
  onSubmit: (eventData: any) => void;
  editEvent?: any;
}

export function CreateEventForm({ onBack, onSubmit, editEvent }: CreateEventFormProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    category: "",
    price: "",
    totalTickets: "",
    imageUrl: "",
  });

  useEffect(() => {
    if (editEvent) {
      // Convertir fecha de formato legible a formato YYYY-MM-DD para el input
      let dateValue = "";
      if (editEvent.date) {
        try {
          // Si viene en formato legible (ej: "15 de Noviembre, 2025")
          // Intentar parsearlo
          const dateStr = editEvent.date;
          if (dateStr.includes("de")) {
            // Formato español: "15 de Noviembre, 2025"
            const months: { [key: string]: string } = {
              "enero": "01", "febrero": "02", "marzo": "03", "abril": "04",
              "mayo": "05", "junio": "06", "julio": "07", "agosto": "08",
              "septiembre": "09", "octubre": "10", "noviembre": "11", "diciembre": "12"
            };
            const parts = dateStr.replace(",", "").split(" ");
            if (parts.length === 4) {
              const day = parts[0].padStart(2, "0");
              const month = months[parts[2].toLowerCase()] || "01";
              const year = parts[3];
              dateValue = `${year}-${month}-${day}`;
            }
          } else {
            // Si ya viene en formato ISO o similar, intentar parsearlo directamente
            const date = new Date(editEvent.start_datetime || editEvent.date);
            if (!isNaN(date.getTime())) {
              dateValue = date.toISOString().split("T")[0];
            }
          }
        } catch (e) {
          console.error("Error parsing date:", e);
        }
      }

      // Convertir hora de formato legible a formato HH:MM para el input
      let timeValue = "";
      if (editEvent.time) {
        try {
          // Si viene en formato legible (ej: "18:00")
          const timeStr = editEvent.time;
          if (timeStr.includes(":")) {
            // Ya está en formato HH:MM o HH:MM:SS
            timeValue = timeStr.substring(0, 5); // Tomar solo HH:MM
          } else if (editEvent.start_datetime) {
            // Extraer hora del datetime
            const date = new Date(editEvent.start_datetime);
            if (!isNaN(date.getTime())) {
              const hours = date.getHours().toString().padStart(2, "0");
              const minutes = date.getMinutes().toString().padStart(2, "0");
              timeValue = `${hours}:${minutes}`;
            }
          }
        } catch (e) {
          console.error("Error parsing time:", e);
        }
      }

      // Si tenemos start_datetime, usarlo como fuente principal
      if (editEvent.start_datetime && !dateValue) {
        try {
          const date = new Date(editEvent.start_datetime);
          if (!isNaN(date.getTime())) {
            dateValue = date.toISOString().split("T")[0];
            if (!timeValue) {
              const hours = date.getHours().toString().padStart(2, "0");
              const minutes = date.getMinutes().toString().padStart(2, "0");
              timeValue = `${hours}:${minutes}`;
            }
          }
        } catch (e) {
          console.error("Error parsing start_datetime:", e);
        }
      }

      setFormData({
        title: editEvent.title || "",
        description: editEvent.description || "",
        date: dateValue,
        time: timeValue,
        location: editEvent.location || "",
        category: editEvent.category || "Música",
        price: editEvent.price?.toString() || "",
        totalTickets: editEvent.totalTickets?.toString() || editEvent.availableTickets?.toString() || "",
        imageUrl: editEvent.image || "",
      });
    }
  }, [editEvent]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const eventData: any = {
      title: formData.title,
      description: formData.description,
      date: formData.date,
      time: formData.time,
      location: formData.location,
      category: formData.category,
      price: parseFloat(formData.price),
      totalTickets: parseInt(formData.totalTickets),
      image: formData.imageUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
    };

    // Only set availableTickets for new events
    if (!editEvent) {
      eventData.availableTickets = parseInt(formData.totalTickets);
    }
    
    onSubmit(eventData);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button variant="ghost" onClick={onBack} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t("createEvent.backToDashboard")}
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{editEvent ? t("createEvent.editTitle") : t("createEvent.title")}</CardTitle>
          <p className="text-sm text-gray-600">
            {t("createEvent.subtitle")}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="mb-4">{t("createEvent.basicInfo")}</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">{t("createEvent.eventName")} {t("createEvent.required")}</Label>
                  <Input
                    id="title"
                    placeholder="Ej: Festival de Rock 2025"
                    required
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="description">{t("createEvent.description")} {t("createEvent.required")}</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe tu evento, artistas, actividades, etc."
                    rows={4}
                    required
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="category">{t("createEvent.category")} {t("createEvent.required")}</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => handleInputChange("category", value)}
                    required
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder={t("createEvent.selectCategory")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Música">{t("category.music")}</SelectItem>
                      <SelectItem value="Deportes">{t("category.sports")}</SelectItem>
                      <SelectItem value="Teatro">{t("category.theater")}</SelectItem>
                      <SelectItem value="Conferencias">{t("category.conferences")}</SelectItem>
                      <SelectItem value="Festivales">{t("category.festivals")}</SelectItem>
                      <SelectItem value="Otro">{t("category.other")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="mb-4">{t("createEvent.dateLocation")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">{t("createEvent.date")} {t("createEvent.required")}</Label>
                  <Input
                    id="date"
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="time">{t("createEvent.time")} {t("createEvent.required")}</Label>
                  <Input
                    id="time"
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => handleInputChange("time", e.target.value)}
                  />
                  <p className="text-xs text-gray-600 mt-1">{t("createEvent.timeHelper")}</p>
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor="location">{t("createEvent.location")} {t("createEvent.required")}</Label>
                <Input
                  id="location"
                  placeholder="Ej: Estadio River Plate, Buenos Aires"
                  required
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="mb-4">{t("createEvent.ticketsPricing")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">{t("createEvent.pricePerTicket")} ($) {t("createEvent.required")}</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="totalTickets">{t("createEvent.ticketQuantity")} {t("createEvent.required")}</Label>
                  <Input
                    id="totalTickets"
                    type="number"
                    placeholder="0"
                    min="1"
                    required
                    value={formData.totalTickets}
                    onChange={(e) => handleInputChange("totalTickets", e.target.value)}
                    disabled={!!editEvent}
                  />
                  {editEvent && (
                    <p className="text-xs text-gray-600 mt-1">
                      No se puede modificar el total de entradas de un evento existente
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="mb-4">{t("createEvent.eventImage")}</h3>
              <div>
                <Label htmlFor="imageUrl">{t("createEvent.imageUrl")}</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  value={formData.imageUrl}
                  onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                />
                <p className="text-sm text-gray-600 mt-1">
                  {t("createEvent.imageHelper")}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                {t("createEvent.cancel")}
              </Button>
              <Button type="submit" className="flex-1">
                {editEvent ? t("createEvent.update") : t("createEvent.publish")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
