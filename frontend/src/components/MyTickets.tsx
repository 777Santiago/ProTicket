import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { projectId } from "../utils/supabase/info";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Calendar, MapPin, Download, Loader2 } from "lucide-react";
import QRCode from "react-qr-code";
import { toast } from "sonner@2.0.3";

interface Purchase {
  id: string;
  eventId: string;
  quantity: number;
  totalPrice: number;
  confirmationCode: string;
  purchaseDate: string;
  buyerName: string;
  buyerEmail: string;
  eventTitle?: string;
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
}

export function MyTickets() {
  const { accessToken } = useAuth();
  const { t } = useLanguage();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyTickets();
  }, [accessToken]);

  async function fetchMyTickets() {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-45ce65c6/purchases/my-tickets`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(t("myTickets.errorLoading"));
      }

      const data = await response.json();
      setPurchases(data.purchases || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast.error(t("myTickets.errorLoading"));
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (purchases.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="mb-8">{t("myTickets.title")}</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">{t("myTickets.noTicketsYet")}</p>
            <Button onClick={() => window.location.reload()}>{t("myTickets.viewEvents")}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="mb-8">{t("myTickets.title")}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {purchases.map((purchase) => (
          <Card key={purchase.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="mb-2">{purchase.eventTitle || t("myTickets.event")}</CardTitle>
                  <Badge>{t("myTickets.confirmed")}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">{t("myTickets.confirmationCode")}</p>
                  <p className="font-mono">{purchase.confirmationCode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t("myTickets.quantity")}</p>
                  <p>{purchase.quantity} {purchase.quantity === 1 ? t("myTickets.ticket") : t("myTickets.tickets")}</p>
                </div>
              </div>

              {purchase.eventDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{purchase.eventDate} • {purchase.eventTime}</span>
                </div>
              )}

              {purchase.eventLocation && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{purchase.eventLocation}</span>
                </div>
              )}

              <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300">
                <div className="flex flex-col items-center">
                  <div className="bg-white p-2">
                    <QRCode
                      value={`PROTICKET-${purchase.confirmationCode}`}
                      size={150}
                    />
                  </div>
                  <p className="text-xs text-center text-gray-500 mt-2">
                    {t("myTickets.presentCode")}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Button variant="outline" className="w-full" onClick={() => window.print()}>
                  <Download className="h-4 w-4 mr-2" />
                  {t("myTickets.downloadPrint")}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
