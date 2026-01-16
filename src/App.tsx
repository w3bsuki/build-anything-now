import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { ScrollToTop } from "./components/ScrollToTop";
import { LanguageDetectionBanner } from "./components/LanguageDetectionBanner";
import { AuthGuard } from "./components/auth/AuthGuard";
import { OnboardingRedirect } from "./hooks/useOnboardingRedirect";
import { ProductTour } from "./components/tour/ProductTour";
import Index from "./pages/Index";
import AnimalProfile from "./pages/AnimalProfile";
import Campaigns from "./pages/Campaigns";
import CampaignProfile from "./pages/CampaignProfile";
import Partners from "./pages/Partners";
import Clinics from "./pages/Clinics";
import ClinicProfile from "./pages/ClinicProfile";
import PartnerProfile from "./pages/PartnerProfile";
import Account from "./pages/Account";
import PublicProfile from "./pages/PublicProfile";
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
import CommunityMembers from "./pages/CommunityMembers";
import CommunityActivity from "./pages/CommunityActivity";
import VolunteerProfile from "./pages/VolunteerProfile";
import Presentation from "./pages/Presentation";
import PartnerPresentation from "./pages/PartnerPresentation";
import NotFound from "./pages/NotFound";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import HomepageDemo from "./pages/HomepageDemo";
import CardComparisonDemo from "./pages/CardComparisonDemo";
import OnboardingPage from "./pages/onboarding/OnboardingPage";
import ClaimOrganizationPage from "./pages/onboarding/ClaimOrganizationPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <OnboardingRedirect>
          <Navigation />
          <LanguageDetectionBanner />
          <ProductTour />
          <Routes>
            {/* Onboarding routes - no navigation bar */}
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/onboarding/claim" element={<ClaimOrganizationPage />} />
            
            {/* Auth routes */}
            <Route path="/sign-in/*" element={<SignInPage />} />
            <Route path="/sign-up/*" element={<SignUpPage />} />
            
            {/* Demo route - DELETE AFTER DECIDING */}
            <Route path="/demo" element={<HomepageDemo />} />
            <Route path="/card-compare" element={<CardComparisonDemo />} />
            
            {/* Main app routes */}
            <Route path="/" element={<Index />} />
            <Route path="/case/:id" element={<AnimalProfile />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/campaigns/:id" element={<CampaignProfile />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/partners/:id" element={<PartnerProfile />} />
            <Route path="/clinics" element={<Clinics />} />
            <Route path="/clinics/:id" element={<ClinicProfile />} />
            {/* Profile redirect: /profile → /u/me */}
            <Route path="/profile" element={<Navigate to="/u/me" replace />} />
            {/* Account settings hub */}
            <Route
              path="/account"
              element={
                <AuthGuard>
                  <Account />
                </AuthGuard>
              }
            />
            {/* Public profile pages */}
            <Route path="/u/:userId" element={<PublicProfile />} />
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
            <Route path="/community/members" element={<CommunityMembers />} />
            <Route path="/community/activity" element={<CommunityActivity />} />
            <Route path="/community/:postId" element={<CommunityPost />} />
            <Route path="/volunteers/:id" element={<VolunteerProfile />} />
            <Route path="/presentation" element={<Presentation />} />
            <Route path="/partner" element={<PartnerPresentation />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </OnboardingRedirect>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
