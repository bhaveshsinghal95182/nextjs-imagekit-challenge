"use client";

import Link from "next/link";
import {useRouter} from "next/navigation";
import * as React from "react";

import {useSignUp} from "@clerk/nextjs";

import ROUTES from "@/constants/routes";

export default function Page() {
  const {isLoaded, signUp, setActive} = useSignUp();
  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [verifying, setVerifying] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [code, setCode] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();

  const getErrorMessage = (err: unknown) => {
    // Prefer common fields, fall back to stringified object
    try {
      if (!err) return "An unknown error occurred.";
      if (typeof err === "string") return err;
      // Clerk errors may have a `message` property
      const anyErr = err as unknown & {message?: string; errors?: unknown};
      if (anyErr.message) return String(anyErr.message);
      // Some errors include an `errors` array or `errors` object
      if (anyErr.errors) return JSON.stringify(anyErr.errors);
      // If it's an object, return a compact JSON
      return JSON.stringify(err, null, 2);
    } catch (_e) {
      return "An error occurred (failed to parse).";
    }
  };

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
      <main className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md mx-auto w-full bg-card/95 p-6 rounded-xl shadow-lg border border-border/40">
          <h1 className="text-2xl font-semibold mb-2 text-foreground">
            Verify your email
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            Enter the verification code we sent to your email address.
          </p>

          <form onSubmit={handleVerify} className="space-y-3">
            {error ? (
              <div
                role="alert"
                className="rounded-md bg-red-50 border border-red-200 p-2 text-sm text-red-700"
              >
                {error}
              </div>
            ) : null}

            <label className="sr-only" htmlFor="code">
              Verification code
            </label>
            <input
              id="code"
              name="code"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="123456"
              className="w-full rounded-full px-4 py-2 border border-transparent bg-input text-foreground placeholder:opacity-60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
            />

            <div className="flex items-center justify-between gap-3 mt-3">
              <div className="flex-1">
                <button
                  type="submit"
                  className="w-full rounded-full py-2 px-4 bg-gradient-to-r from-pink-500 to-pink-700 text-white font-medium shadow hover:opacity-95 active:opacity-90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Verifying..." : "Verify"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md mx-auto w-full bg-card/95 p-6 rounded-xl shadow-lg border border-border/40">
        <h1 className="text-2xl font-semibold mb-2 text-foreground">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground mb-4">
          Sign up to save and transform your memories.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error ? (
            <div
              role="alert"
              className="rounded-md bg-red-50 border border-red-200 p-2 text-sm text-red-700"
            >
              {error}
            </div>
          ) : null}
          <label className="sr-only" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="you@domain.com"
            value={emailAddress}
            onChange={e => setEmailAddress(e.target.value)}
            className="w-full rounded-full px-4 py-2 border border-transparent bg-input text-foreground placeholder:opacity-60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
          />

          <label className="sr-only" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="Create a password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full rounded-full px-4 py-2 border border-transparent bg-input text-foreground placeholder:opacity-60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
          />

          <div className="flex items-center justify-between gap-3 mt-3">
            <div className="flex-1">
              <button
                type="submit"
                className="w-full rounded-full py-2 px-4 bg-gradient-to-r from-pink-500 to-pink-700 text-white font-medium shadow hover:opacity-95 active:opacity-90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating account..." : "Continue"}
              </button>
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
      </div>
    </main>
  );
}
