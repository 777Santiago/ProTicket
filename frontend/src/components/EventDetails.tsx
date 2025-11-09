import {
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
  Clock,
  Info,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useLanguage } from "../contexts/LanguageContext";

interface EventDetailsProps {
  event: {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    price: number;
    category: string;
    image: string;
    availableTickets: number;
    description: string;
    organizer?: string;
    organizerName?: string;
  };
  onBack: () => void;
  onBuyTickets: () => void;
}

export function EventDetails({
  event,
  onBack,
  onBuyTickets,
}: EventDetailsProps) {
  const { t } = useLanguage();
  
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button variant="ghost" onClick={onBack} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t("eventDetails.backToEvents")}
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="aspect-video relative overflow-hidden rounded-lg mb-6">
            <ImageWithFallback
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <Badge className="mb-3">{event.category}</Badge>
                <h1 className="mb-2">{event.title}</h1>
                <p className="text-gray-600">
                  {t("eventDetails.organizedBy")}{" "}
                  {event.organizerName ||
                    event.organizer ||
                    "ProTicket"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">{t("event.date")}</p>
                  <p>{event.date}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">{t("event.time")}</p>
                  <p>{event.time}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">
                    {t("event.location")}
                  </p>
                  <p>{event.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">
                    {t("eventDetails.availability")}
                  </p>
                  <p>{event.availableTickets} {t("myTickets.tickets")}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-3">{t("eventDetails.aboutEvent")}</h2>
              <p className="text-gray-700 leading-relaxed">
                {event.description}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Card>
              <CardHeader>
                <CardTitle>{t("eventDetails.buyTickets")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {t("eventDetails.pricePerTicket")}
                  </p>
                  <p className="text-blue-600">
                    ${event.price.toLocaleString()}
                  </p>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-900">
                    {t("eventDetails.digitalTicketInfo")}
                  </p>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={onBuyTickets}
                  disabled={event.availableTickets === 0}
                >
                  {event.availableTickets > 0
                    ? t("eventDetails.buyNow")
                    : t("event.soldOut")}
                </Button>

                <div className="pt-4 border-t space-y-2 text-sm text-gray-600">
                  <p>✓ {t("eventDetails.instantDelivery")}</p>
                  <p>✓ {t("eventDetails.secureQR")}</p>
                  <p>✓ {t("eventDetails.support247")}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}