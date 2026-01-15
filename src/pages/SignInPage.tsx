import { SignIn } from "@clerk/clerk-react";

const SignInPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/10 to-background p-4">
      <SignIn
        appearance={{
          elements: {
            rootBox: "w-full max-w-sm",
            card: "shadow-lg rounded-2xl",
            headerBox: "flex flex-col items-center gap-1 pb-4",
            headerTitle: "text-lg font-bold",
            headerSubtitle: "hidden",
            socialButtonsBlockButton: "rounded-xl",
            formButtonPrimary: "bg-primary hover:bg-primary/90 rounded-xl",
            footerActionLink: "text-primary hover:text-primary/90",
          },
          layout: {
            logoImageUrl: "/favicon.ico",
            logoPlacement: "inside",
          },
        }}
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/"
        forceRedirectUrl="/"
      />
    </div>
  );
};

export default SignInPage;
