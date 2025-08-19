
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import HomePage from "@/components/HomePage";
import LoginScreen from "@/components/LoginScreen";
import QuizCreator from "@/components/QuizCreator";
import NotFound from "./pages/NotFound";
import ViewResult from "./pages/ViewResult";
import Credits from "@/components/Credits";
import { toast } from "@/components/ui/use-toast";
import React from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";

const queryClient = new QueryClient();

import { useLocation } from "react-router-dom";

const AppContent = () => {
  const { user, loading } = useAuth();

  const location = useLocation();
  React.useEffect(() => {
    if (!loading && user && location.pathname == "/home") {
      toast({
        title: "Session loaded",
        description: "Your session has been loaded successfully.",
      });
    }
  }, [loading, user, location]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<LoginScreen />} />
        <Route path="/results" element={<ViewResult />} />
        <Route path="/credits" element={<Credits />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<QuizCreator />} />
      <Route path="/results" element={<ViewResult />} />
      <Route path="/credits" element={<Credits />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Toaster />
            <Sonner />
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
