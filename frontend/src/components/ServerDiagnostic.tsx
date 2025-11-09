import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";

export function ServerDiagnostic() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runDiagnostic = async () => {
    setTesting(true);
    setResults(null);

    const diagnostics: any = {
      projectId,
      anonKeyStart: publicAnonKey.substring(0, 20),
      timestamp: new Date().toISOString(),
      tests: [],
    };

    // Test 1: Health endpoint
    try {
      console.log("Testing health endpoint...");
      const healthUrl = `https://${projectId}.supabase.co/functions/v1/make-server-45ce65c6/health`;
      const healthResponse = await fetch(healthUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });
      
      diagnostics.tests.push({
        name: "Health Check",
        url: healthUrl,
        status: healthResponse.status,
        ok: healthResponse.ok,
        data: healthResponse.ok ? await healthResponse.json() : await healthResponse.text(),
      });
    } catch (error: any) {
      diagnostics.tests.push({
        name: "Health Check",
        error: error.message,
        type: error.constructor.name,
      });
    }

    // Test 2: Events endpoint
    try {
      console.log("Testing events endpoint...");
      const eventsUrl = `https://${projectId}.supabase.co/functions/v1/make-server-45ce65c6/events`;
      const eventsResponse = await fetch(eventsUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });
      
      diagnostics.tests.push({
        name: "Events Endpoint",
        url: eventsUrl,
        status: eventsResponse.status,
        ok: eventsResponse.ok,
        data: eventsResponse.ok ? await eventsResponse.json() : await eventsResponse.text(),
      });
    } catch (error: any) {
      diagnostics.tests.push({
        name: "Events Endpoint",
        error: error.message,
        type: error.constructor.name,
      });
    }

    // Test 3: Root endpoint
    try {
      console.log("Testing root endpoint...");
      const rootUrl = `https://${projectId}.supabase.co/functions/v1/make-server-45ce65c6/`;
      const rootResponse = await fetch(rootUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });
      
      diagnostics.tests.push({
        name: "Root Endpoint",
        url: rootUrl,
        status: rootResponse.status,
        ok: rootResponse.ok,
        data: rootResponse.ok ? await rootResponse.json() : await rootResponse.text(),
      });
    } catch (error: any) {
      diagnostics.tests.push({
        name: "Root Endpoint",
        error: error.message,
        type: error.constructor.name,
      });
    }

    setResults(diagnostics);
    setTesting(false);
  };

  return (
    <Card className="max-w-4xl mx-auto m-8">
      <CardHeader>
        <CardTitle>Server Diagnostic Tool</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            <strong>Project ID:</strong> {projectId}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Base URL:</strong> https://{projectId}.supabase.co/functions/v1/make-server-45ce65c6
          </p>
        </div>

        <Button onClick={runDiagnostic} disabled={testing}>
          {testing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            "Run Diagnostic"
          )}
        </Button>

        {results && (
          <div className="space-y-4 mt-6">
            <h3 className="font-semibold">Results:</h3>
            {results.tests.map((test: any, index: number) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  {test.ok ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="font-medium">{test.name}</span>
                  {test.status && (
                    <span className={`text-sm px-2 py-1 rounded ${test.ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      Status: {test.status}
                    </span>
                  )}
                </div>
                
                {test.url && (
                  <p className="text-xs text-gray-600 mb-2">URL: {test.url}</p>
                )}
                
                {test.error && (
                  <div className="bg-red-50 p-3 rounded mt-2">
                    <p className="text-sm text-red-900">
                      <strong>Error:</strong> {test.error}
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      Type: {test.type}
                    </p>
                  </div>
                )}
                
                {test.data && (
                  <div className="bg-gray-50 p-3 rounded mt-2">
                    <p className="text-xs font-mono overflow-x-auto">
                      {typeof test.data === 'object' 
                        ? JSON.stringify(test.data, null, 2) 
                        : test.data}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
