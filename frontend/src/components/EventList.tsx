import { Search } from "lucide-react";
import { EventCard } from "./EventCard";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  price: number;
  category: string;
  image: string;
  availableTickets: number;
}

interface EventListProps {
  events: Event[];
  onSelectEvent: (eventId: string) => void;
}

export function EventList({ events, onSelectEvent }: EventListProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || event.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", ...Array.from(new Set(events.map(e => e.category)))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="mb-2">{t("eventList.discover")}</h1>
        <p className="text-gray-600">{t("eventList.findAndBuy")}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t("eventList.searchPlaceholder")}
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder={t("eventList.category")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("eventList.allCategories")}</SelectItem>
            {categories.filter(c => c !== "all").map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map(event => (
          <EventCard key={event.id} event={event} onSelect={onSelectEvent} />
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">{t("eventList.noEventsFound")}</p>
        </div>
      )}
    </div>
  );
}
