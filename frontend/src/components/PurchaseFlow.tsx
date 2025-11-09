import { useState } from "react";
import { ArrowLeft, CreditCard, Mail, User, Ticket } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { useLanguage } from "../contexts/LanguageContext";

interface PurchaseFlowProps {
  event: {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    price: number;
  };
  onBack: () => void;
  onComplete: (purchaseData: any) => void;
}

export function PurchaseFlow({ event, onBack, onComplete }: PurchaseFlowProps) {
  const { t } = useLanguage();
  const [quantity, setQuantity] = useState("1");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const totalPrice = event.price * parseInt(quantity);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate purchase
    const purchaseData = {
      eventId: event.id,
      eventTitle: event.title,
      quantity: parseInt(quantity),
      totalPrice,
      buyerName: formData.name,
      buyerEmail: formData.email,
      confirmationCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
      purchaseDate: new Date().toISOString(),
    };
    
    onComplete(purchaseData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button variant="ghost" onClick={onBack} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t("purchaseFlow.back")}
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("purchaseFlow.purchaseInfo")}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="mb-4">{t("purchaseFlow.buyerData")}</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">{t("purchase.name")}</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="name"
                          placeholder={t("purchaseFlow.fullNamePlaceholder")}
                          className="pl-10"
                          required
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">{t("purchase.email")}</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder={t("purchaseFlow.emailPlaceholder")}
                          className="pl-10"
                          required
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                        />
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{t("purchaseFlow.emailHelper")}</p>
                    </div>

                    <div>
                      <Label htmlFor="phone">{t("purchaseFlow.phone")}</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder={t("purchaseFlow.phonePlaceholder")}
                        required
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="mb-4">{t("purchaseFlow.paymentMethod")}</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cardNumber">{t("purchaseFlow.cardNumber")}</Label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="cardNumber"
                          placeholder={t("purchaseFlow.cardPlaceholder")}
                          className="pl-10"
                          required
                          value={formData.cardNumber}
                          onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">{t("purchaseFlow.expiry")}</Label>
                        <Input
                          id="expiry"
                          placeholder={t("purchaseFlow.expiryPlaceholder")}
                          required
                          value={formData.expiry}
                          onChange={(e) => handleInputChange("expiry", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">{t("purchaseFlow.cvv")}</Label>
                        <Input
                          id="cvv"
                          placeholder={t("purchaseFlow.cvvPlaceholder")}
                          required
                          maxLength={3}
                          value={formData.cvv}
                          onChange={(e) => handleInputChange("cvv", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg">
                  {t("purchaseFlow.completePurchase")} - ${totalPrice.toLocaleString()}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{t("purchaseFlow.purchaseSummary")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t("purchaseFlow.event")}</p>
                <p>{event.title}</p>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-gray-600 mb-1">{t("purchaseFlow.dateAndTime")}</p>
                <p className="text-sm">{event.date}</p>
                <p className="text-sm">{event.time}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">{t("event.location")}</p>
                <p className="text-sm">{event.location}</p>
              </div>

              <Separator />

              <div>
                <Label htmlFor="quantity">{t("purchaseFlow.ticketQuantity")}</Label>
                <Select value={quantity} onValueChange={setQuantity}>
                  <SelectTrigger id="quantity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? t("purchaseFlow.ticket") : t("purchaseFlow.tickets")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t("purchaseFlow.subtotal")}</span>
                  <span>${totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t("purchaseFlow.serviceFee")}</span>
                  <span>$0</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span>{t("purchase.total")}</span>
                  <span className="text-blue-600">${totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-3 bg-green-50 rounded-lg flex items-start gap-2">
                <Ticket className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-green-900">
                  {t("purchaseFlow.instantDeliveryInfo")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
