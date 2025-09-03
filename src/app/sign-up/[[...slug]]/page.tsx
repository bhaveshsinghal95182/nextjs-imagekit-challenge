"use client";

import Link from "next/link";
import {useRouter} from "next/navigation";
import * as React from "react";

import {useSignUp} from "@clerk/nextjs";

import AuthCard from "@/components/auth/auth-card";
import ErrorBanner from "@/components/auth/error-banner";
import PrimaryButton from "@/components/ui/primary-button";
import TextField from "@/components/ui/text-field";
import ROUTES from "@/constants/routes";
import formatError from "@/hooks/use-error-message";

export default function Page() {
  const {isLoaded, signUp, setActive} = useSignUp();
  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [verifying, setVerifying] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [code, setCode] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();

  const getErrorMessage = formatError;

  // Handle submission of the sign-up form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) return;

    // Start the sign-up process using the email and password provided
    setError(null);
    setIsSubmitting(true);
    try {
      await signUp.create({
        emailAddress,
        password,
      });

      // Send the user an email with the verification code
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      // Set 'verifying' true to display second form
      // and capture the OTP code
      setVerifying(true);
    } catch (err: unknown) {
      // Show a compact, user-friendly error message
      const msg = getErrorMessage(err);
      setError(msg);
      // Also log full error for debugging
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle the submission of the verification form
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) return;

    setError(null);
    setIsSubmitting(true);
    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === "complete") {
        await setActive({
          session: signUpAttempt.createdSessionId,
          navigate: async ({session}) => {
            if (session?.currentTask) {
              // Check for tasks and navigate to custom UI to help users resolve them
              // See https://clerk.com/docs/custom-flows/overview#session-tasks
              console.log(session?.currentTask);
              return;
            }

            await router.push("/");
          },
        });
      } else {
        // If the status is not complete, show the status to the user
        setError(`Verification not complete: ${String(signUpAttempt.status)}`);
        console.error(signUpAttempt);
      }
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      setError(msg);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Display the verification form to capture the OTP code
  if (verifying) {
    return (
      <AuthCard
        title="Verify your email"
        subtitle="Enter the verification code we sent to your email address."
      >
        <form onSubmit={handleVerify} className="space-y-3">
          <ErrorBanner message={error} />

          <TextField
            id="code"
            name="code"
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="123456"
            label="Verification code"
          />

          <div className="flex items-center justify-between gap-3 mt-3">
            <div className="flex-1">
              <PrimaryButton type="submit" isLoading={isSubmitting}>
                Verify
              </PrimaryButton>
            </div>
          </div>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Sign up to save and transform your memories."
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <ErrorBanner message={error} />

        <TextField
          id="email"
          type="email"
          name="email"
          placeholder="you@domain.com"
          value={emailAddress}
          onChange={e => setEmailAddress(e.target.value)}
          label="Email address"
        />

        <TextField
          id="password"
          type="password"
          name="password"
          placeholder="Create a password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          label="Password"
        />

        <div className="flex items-center justify-between gap-3 mt-3">
          <div className="flex-1">
            <PrimaryButton type="submit" isLoading={isSubmitting}>
              Continue
            </PrimaryButton>
          </div>
        </div>

        <div id="clerk-captcha" />

        <div className="mt-4 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href={ROUTES["SIGN-IN"]} className="inline-block group ml-1">
            <span className="relative inline-block pb-0.5 text-sm hover:text-foreground">
              Sign in
              <span className="absolute left-0 bottom-0 w-full h-[2px] bg-current transform scale-x-0 origin-center transition-transform duration-300 group-hover:scale-x-100" />
            </span>
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
