import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { ScrollToTop } from "./components/ScrollToTop";
import { RouteErrorBoundary } from "./components/RouteErrorBoundary";
import { AuthGuard } from "./components/auth/AuthGuard";
import { OnboardingRedirect } from "./hooks/useOnboardingRedirect";
import { usePushRegistration } from "./hooks/usePushRegistration";
import { ProductTour } from "./components/tour/ProductTour";
import Index from "./pages/IndexV2";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import { CommunityMobileShellLayout } from "./layouts/CommunityMobileShellLayout";

const AnimalProfile = lazy(() => import("./pages/AnimalProfile"));
const Campaigns = lazy(() => import("./pages/Campaigns"));
const CampaignProfile = lazy(() => import("./pages/CampaignProfile"));
const Partners = lazy(() => import("./pages/Partners"));
const Clinics = lazy(() => import("./pages/Clinics"));
const ClinicProfile = lazy(() => import("./pages/ClinicProfile"));
const PartnerProfile = lazy(() => import("./pages/PartnerProfile"));
const Account = lazy(() => import("./pages/Account"));
const PublicProfile = lazy(() => import("./pages/PublicProfile"));
const ProfileEdit = lazy(() => import("./pages/ProfileEdit"));
const MyDonations = lazy(() => import("./pages/MyDonations"));
const DonationHistory = lazy(() => import("./pages/DonationHistory"));
const Achievements = lazy(() => import("./pages/Achievements"));
const PaymentMethods = lazy(() => import("./pages/PaymentMethods"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Settings = lazy(() => import("./pages/Settings"));
const Subscriptions = lazy(() => import("./pages/Subscriptions"));
const CreateCase = lazy(() => import("./pages/CreateCase"));
const CreateCaseAi = lazy(() => import("./pages/CreateCaseAi"));
const CreateAdoption = lazy(() => import("./pages/CreateAdoption"));
const Messages = lazy(() => import("./pages/Messages"));
const Community = lazy(() => import("./pages/Community"));
const CommunityPost = lazy(() => import("./pages/CommunityPost"));
const VolunteerProfile = lazy(() => import("./pages/VolunteerProfile"));
const VolunteersDirectory = lazy(() => import("./pages/VolunteersDirectory"));
const NotFound = lazy(() => import("./pages/NotFound"));
const OnboardingPage = lazy(() => import("./pages/onboarding/OnboardingPage"));
const ClaimOrganizationPage = lazy(() => import("./pages/onboarding/ClaimOrganizationPage"));
const CommunityMembers = lazy(() => import("./pages/CommunityMembers"));
const CommunityActivity = lazy(() => import("./pages/CommunityActivity"));
const CommunityFollowedPreview = lazy(() => import("./pages/community/CommunityFollowedPreview"));
const CommunityMessagesPreview = lazy(() => import("./pages/community/CommunityMessagesPreview"));
const Presentation = lazy(() => import("./pages/Presentation"));
const PartnerPresentation = lazy(() => import("./pages/PartnerPresentation"));
const ModerationQueue = lazy(() => import("./pages/admin/ModerationQueue"));
const ClinicClaimsQueue = lazy(() => import("./pages/admin/ClinicClaimsQueue"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));

const App = () => {
  usePushRegistration();

  return (
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <ScrollToTop />
        <OnboardingRedirect>
          <Navigation />
          <ProductTour />
          <RouteErrorBoundary>
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
                  path="/subscriptions"
                  element={
                    <AuthGuard>
                      <Subscriptions />
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
                <Route path="/volunteers" element={<VolunteersDirectory />} />
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
                <Route
                  path="/admin/analytics"
                  element={
                    <AuthGuard>
                      <AdminAnalytics />
                    </AuthGuard>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </RouteErrorBoundary>
        </OnboardingRedirect>
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;

