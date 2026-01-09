import React, { useState, useEffect } from 'react';

export const ApiTestSection = () => {
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const testApiConnection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api');
      const data = await response.json();
      setApiResponse(data.message);
    } catch (err) {
      setError('Failed to connect to the backend API');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testApiConnection();
  }, []);

  return (
    <section className="py-20 bg-card/30 border-y border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Frontend-Backend Integration Test</h2>
          <p className="text-muted-foreground">
            Testing connection between frontend and backend services
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto bg-background rounded-xl border border-border p-8 shadow-lg">
          <div className="space-y-6">
            <div className="flex flex-col items-center">
              <h3 className="text-xl font-semibold mb-4">API Connection Status</h3>
              
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
                  <span>Testing connection...</span>
                </div>
              ) : error ? (
                <div className="text-center">
                  <div className="text-destructive text-lg font-medium mb-2">Connection Failed</div>
                  <p className="text-muted-foreground mb-4">{error}</p>
                  <button 
                    onClick={testApiConnection}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Retry Connection
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-success text-lg font-medium mb-2">Connected Successfully</div>
                  <p className="text-muted-foreground mb-4">Response from backend: {apiResponse}</p>
                  <button 
                    onClick={testApiConnection}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Test Again
                  </button>
                </div>
              )}
            </div>
            
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">How it works:</h4>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>Frontend makes a request to /api endpoint</li>
                <li>Vite proxy forwards the request to http://localhost:5000</li>
                <li>Backend responds with welcome message</li>
                <li>No CORS issues due to proxy configuration</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};