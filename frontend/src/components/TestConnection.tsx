import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { apiRequest } from "../config/api";

export function TestConnection() {
  const [status, setStatus] = useState<string>("No probado");
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);

  const testHealth = async () => {
    setLoading(true);
    try {
      const response = await apiRequest("/health");
      setStatus(`✅ Conectado: ${response.service}`);
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testEvents = async () => {
    setLoading(true);
    try {
      const response = await apiRequest("/events/");
      setEvents(response || []);
      setStatus(`✅ Eventos obtenidos: ${response?.length || 0} eventos`);
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto m-8">
      <CardHeader>
        <CardTitle>Probar Conexión con Backend</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            <strong>Backend URL:</strong> http://127.0.0.1:8000
          </p>
          <p className="text-sm">
            <strong>Estado:</strong> {status}
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={testHealth} disabled={loading}>
            {loading ? "Probando..." : "Probar /health"}
          </Button>
          <Button onClick={testEvents} disabled={loading} variant="secondary">
            {loading ? "Probando..." : "Probar /events"}
          </Button>
        </div>

        {events.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Eventos encontrados:</h3>
            <div className="space-y-2">
              {events.map((event) => (
                <div key={event.id_event} className="p-2 bg-gray-50 rounded">
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-gray-600">
                    Ubicación: {event.location}
                  </p>
                  <p className="text-sm text-gray-600">
                    Precio: ${event.price}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
