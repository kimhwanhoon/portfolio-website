import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      {/* Sign-up is disabled for this app — admin-only access. */}
      <SignIn signUpUrl="/sign-in" />
    </div>
  );
}
