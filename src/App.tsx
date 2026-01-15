import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { ScrollToTop } from "./components/ScrollToTop";
import { LanguageDetectionBanner } from "./components/LanguageDetectionBanner";
import { AuthGuard } from "./components/auth/AuthGuard";
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
import Community from "./pages/Community";
import CommunityPost from "./pages/CommunityPost";
import VolunteerProfile from "./pages/VolunteerProfile";
import Presentation from "./pages/Presentation";
import PartnerPresentation from "./pages/PartnerPresentation";
import NotFound from "./pages/NotFound";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Navigation />
        <LanguageDetectionBanner />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/case/:id" element={<AnimalProfile />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/campaigns/:id" element={<CampaignProfile />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/partners/:id" element={<PartnerProfile />} />
          <Route path="/clinics" element={<Clinics />} />
          <Route path="/clinics/:id" element={<ClinicProfile />} />
          <Route path="/sign-in/*" element={<SignInPage />} />
          <Route path="/sign-up/*" element={<SignUpPage />} />
          <Route
            path="/profile"
            element={
              <AuthGuard>
                <Profile />
              </AuthGuard>
            }
          />
          <Route
            path="/donations"
            element={
              <AuthGuard>
                <MyDonations />
              </AuthGuard>
            }
          />
          <Route
            path="/history"
            element={
              <AuthGuard>
                <DonationHistory />
              </AuthGuard>
            }
          />
          <Route
            path="/achievements"
            element={
              <AuthGuard>
                <Achievements />
              </AuthGuard>
            }
          />
          <Route
            path="/payment"
            element={
              <AuthGuard>
                <PaymentMethods />
              </AuthGuard>
            }
          />
          <Route
            path="/notifications"
            element={
              <AuthGuard>
                <Notifications />
              </AuthGuard>
            }
          />
          <Route
            path="/settings"
            element={
              <AuthGuard>
                <Settings />
              </AuthGuard>
            }
          />
          <Route
            path="/create-case"
            element={
              <AuthGuard>
                <CreateCase />
              </AuthGuard>
            }
          />
          <Route
            path="/create-adoption"
            element={
              <AuthGuard>
                <CreateAdoption />
              </AuthGuard>
            }
          />
          <Route path="/community" element={<Community />} />
          <Route path="/community/:postId" element={<CommunityPost />} />
          <Route path="/volunteers/:id" element={<VolunteerProfile />} />
          <Route path="/presentation" element={<Presentation />} />
          <Route path="/partner" element={<PartnerPresentation />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
