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
      setFormData({
        title: editEvent.title || "",
        description: editEvent.description || "",
        date: editEvent.date || "",
        time: editEvent.time || "",
        location: editEvent.location || "",
        category: editEvent.category || "",
        price: editEvent.price?.toString() || "",
        totalTickets: editEvent.totalTickets?.toString() || "",
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
