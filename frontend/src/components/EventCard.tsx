import { Calendar, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useLanguage } from "../contexts/LanguageContext";

interface EventCardProps {
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
  };
  onSelect: (eventId: string) => void;
}

export function EventCard({ event, onSelect }: EventCardProps) {
  const { t } = useLanguage();
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onSelect(event.id)}>
      <div className="aspect-video relative overflow-hidden">
        <ImageWithFallback 
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <Badge className="absolute top-3 right-3 bg-white text-gray-900">
          {event.category}
        </Badge>
      </div>
      
      <CardContent className="p-4">
        <h3 className="mb-3">{event.title}</h3>
        
        <div className="space-y-2 text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{event.date} • {event.time}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{event.location}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="text-sm">{event.availableTickets} {t("eventCard.availableTickets")}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div>
          <span className="text-sm text-gray-600">{t("eventCard.from")}</span>
          <p className="text-blue-600">${event.price.toLocaleString()}</p>
        </div>
        <Button onClick={(e) => { e.stopPropagation(); onSelect(event.id); }}>
          {t("eventCard.viewDetails")}
        </Button>
      </CardFooter>
    </Card>
  );
}
