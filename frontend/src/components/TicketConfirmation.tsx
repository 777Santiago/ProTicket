import { CheckCircle, Download, Mail, Printer, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import QRCode from "react-qr-code";
import { useLanguage } from "../contexts/LanguageContext";

interface TicketConfirmationProps {
  purchase: {
    eventTitle: string;
    quantity: number;
    totalPrice: number;
    buyerName: string;
    buyerEmail: string;
    confirmationCode: string;
    purchaseDate: string;
  };
  event: {
    date: string;
    time: string;
    location: string;
  };
  onBackToEvents: () => void;
}

export function TicketConfirmation({ purchase, event, onBackToEvents }: TicketConfirmationProps) {
  const { t, language } = useLanguage();
  
  const handleDownloadPDF = () => {
    // Simulate PDF download
    alert(t("ticketConfirmation.alertPDF"));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="mb-2">{t("ticketConfirmation.title")}</h1>
        <p className="text-gray-600">
          {t("ticketConfirmation.emailSent")} <span>{purchase.buyerEmail}</span>
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t("ticketConfirmation.purchaseDetails")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">{t("confirmation.code")}</p>
              <p className="font-mono">{purchase.confirmationCode}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t("ticketConfirmation.purchaseDate")}</p>
              <p>{new Date(purchase.purchaseDate).toLocaleDateString(language === "es" ? "es-ES" : "en-US")}</p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-gray-600 mb-1">{t("purchaseFlow.event")}</p>
            <p>{purchase.eventTitle}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">{t("event.date")}</p>
              <p className="text-sm">{event.date}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t("event.time")}</p>
              <p className="text-sm">{event.time}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600">{t("event.location")}</p>
            <p className="text-sm">{event.location}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">{t("ticketConfirmation.holderName")}</p>
              <p>{purchase.buyerName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t("myTickets.quantity")}</p>
              <p>{purchase.quantity} {purchase.quantity === 1 ? t("purchaseFlow.ticket") : t("purchaseFlow.tickets")}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600">{t("ticketConfirmation.totalPaid")}</p>
            <p className="text-blue-600">${purchase.totalPrice.toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t("ticketConfirmation.yourQR")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300">
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 mb-4">
                <QRCode
                  value={`PROTICKET-${purchase.confirmationCode}`}
                  size={200}
                />
              </div>
              <p className="text-sm text-center text-gray-600 mb-2">
                {t("ticketConfirmation.presentQR")}
              </p>
              <p className="text-xs text-center text-gray-500 font-mono">
                {purchase.confirmationCode}
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">
              {t("ticketConfirmation.importantSave")}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Button onClick={handleDownloadPDF} variant="outline" className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          {t("ticketConfirmation.downloadPDF")}
        </Button>
        <Button onClick={handlePrint} variant="outline" className="flex-1">
          <Printer className="h-4 w-4 mr-2" />
          {t("ticketConfirmation.print")}
        </Button>
        <Button variant="outline" className="flex-1">
          <Mail className="h-4 w-4 mr-2" />
          {t("ticketConfirmation.resendEmail")}
        </Button>
      </div>

      <div className="text-center">
        <Button onClick={onBackToEvents} variant="ghost">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("eventDetails.backToEvents")}
        </Button>
      </div>
    </div>
  );
}
