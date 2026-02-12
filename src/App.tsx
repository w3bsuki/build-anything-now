import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { ScrollToTop } from "./components/ScrollToTop";
import { AuthGuard } from "./components/auth/AuthGuard";
import { OnboardingRedirect } from "./hooks/useOnboardingRedirect";
import { ProductTour } from "./components/tour/ProductTour";
import Index from "./pages/IndexV2";
import AnimalProfile from "./pages/AnimalProfile";
import Campaigns from "./pages/Campaigns";
import CampaignProfile from "./pages/CampaignProfile";
import Partners from "./pages/Partners";
import Clinics from "./pages/Clinics";
import ClinicProfile from "./pages/ClinicProfile";
import PartnerProfile from "./pages/PartnerProfile";
import Account from "./pages/Account";
import PublicProfile from "./pages/PublicProfile";
import ProfileEdit from "./pages/ProfileEdit";
import MyDonations from "./pages/MyDonations";
import DonationHistory from "./pages/DonationHistory";
import Achievements from "./pages/Achievements";
import PaymentMethods from "./pages/PaymentMethods";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import CreateCase from "./pages/CreateCase";
import CreateCaseAi from "./pages/CreateCaseAi";
import CreateAdoption from "./pages/CreateAdoption";
import Messages from "./pages/Messages";
import Community from "./pages/Community";
import CommunityPost from "./pages/CommunityPost";
import VolunteerProfile from "./pages/VolunteerProfile";
import NotFound from "./pages/NotFound";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import OnboardingPage from "./pages/onboarding/OnboardingPage";
import ClaimOrganizationPage from "./pages/onboarding/ClaimOrganizationPage";
import { CommunityMobileShellLayout } from "./layouts/CommunityMobileShellLayout";

const CommunityMembers = lazy(() => import("./pages/CommunityMembers"));
const CommunityActivity = lazy(() => import("./pages/CommunityActivity"));
const CommunityFollowedPreview = lazy(() => import("./pages/community/CommunityFollowedPreview"));
const CommunityMessagesPreview = lazy(() => import("./pages/community/CommunityMessagesPreview"));
const Presentation = lazy(() => import("./pages/Presentation"));
const PartnerPresentation = lazy(() => import("./pages/PartnerPresentation"));
const ModerationQueue = lazy(() => import("./pages/admin/ModerationQueue"));
const ClinicClaimsQueue = lazy(() => import("./pages/admin/ClinicClaimsQueue"));

const App = () => (
  <TooltipProvider>
    <Toaster />
    <BrowserRouter>
      <ScrollToTop />
      <OnboardingRedirect>
        <Navigation />
        <ProductTour />
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
          <Routes>
            {/* Onboarding routes - no navigation bar */}
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/onboarding/claim" element={<ClaimOrganizationPage />} />
            
            {/* Auth routes */}
            <Route path="/sign-in/*" element={<SignInPage />} />
            <Route path="/sign-up/*" element={<SignUpPage />} />
            
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
              path="/profile/edit"
              element={
                <AuthGuard>
                  <ProfileEdit />
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
            <Route path="/create-case-ai" element={<CreateCaseAi />} />
            <Route
              path="/create-adoption"
              element={
                <AuthGuard>
                  <CreateAdoption />
                </AuthGuard>
              }
            />
            <Route
              path="/messages/:userId"
              element={
                <AuthGuard>
                  <Messages />
                </AuthGuard>
              }
            />
            <Route path="/community" element={<CommunityMobileShellLayout />}>
              <Route index element={<Community />} />
              <Route path="followed" element={<CommunityFollowedPreview />} />
              <Route path="messages" element={<CommunityMessagesPreview />} />
              <Route path="members" element={<CommunityMembers />} />
              <Route path="activity" element={<CommunityActivity />} />
              <Route path=":postId" element={<CommunityPost />} />
            </Route>
            <Route path="/volunteers/:id" element={<VolunteerProfile />} />
            <Route path="/presentation" element={<Presentation />} />
            <Route path="/partner" element={<PartnerPresentation />} />
            <Route
              path="/admin/moderation"
              element={
                <AuthGuard>
                  <ModerationQueue />
                </AuthGuard>
              }
            />
            <Route
              path="/admin/clinic-claims"
              element={
                <AuthGuard>
                  <ClinicClaimsQueue />
                </AuthGuard>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </OnboardingRedirect>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;

