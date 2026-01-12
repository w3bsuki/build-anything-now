import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { ScrollToTop } from "./components/ScrollToTop";
import Index from "./pages/Index";
import AnimalProfile from "./pages/AnimalProfile";
import Campaigns from "./pages/Campaigns";
import CampaignProfile from "./pages/CampaignProfile";
import Partners from "./pages/Partners";
import Clinics from "./pages/Clinics";
import ClinicProfile from "./pages/ClinicProfile";
import PartnerProfile from "./pages/PartnerProfile";
import Profile from "./pages/Profile";
import MyDonations from "./pages/MyDonations";
import DonationHistory from "./pages/DonationHistory";
import Achievements from "./pages/Achievements";
import PaymentMethods from "./pages/PaymentMethods";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import CreateCase from "./pages/CreateCase";
import CreateAdoption from "./pages/CreateAdoption";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Navigation />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/case/:id" element={<AnimalProfile />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/campaigns/:id" element={<CampaignProfile />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/partners/:id" element={<PartnerProfile />} />
          <Route path="/clinics" element={<Clinics />} />
          <Route path="/clinics/:id" element={<ClinicProfile />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/donations" element={<MyDonations />} />
          <Route path="/history" element={<DonationHistory />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/payment" element={<PaymentMethods />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/create-case" element={<CreateCase />} />
          <Route path="/create-adoption" element={<CreateAdoption />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
