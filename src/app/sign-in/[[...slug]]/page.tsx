"use client";

import Link from "next/link";
import {useRouter} from "next/navigation";
import * as React from "react";

import {useSignIn} from "@clerk/nextjs";

import ROUTES from "@/constants/routes";

export default function SignInForm() {
  const {isLoaded, signIn, setActive} = useSignIn();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();

  // Convert various error shapes into a compact, user-friendly string.
  // Clerk may return a string, an object with `message`, or a nested `errors`
  // field. We prefer `message` when available, then `errors`, then a
  // compact JSON fallback. This keeps the UI readable while preserving
  // enough detail for debugging when needed.
  const getErrorMessage = (err: unknown) => {
    try {
      if (!err) return "An unknown error occurred.";
      if (typeof err === "string") return err;
      const anyErr = err as unknown & {message?: string; errors?: unknown};
      if (anyErr.message) return String(anyErr.message);
      if (anyErr.errors) return JSON.stringify(anyErr.errors);
      // Fallback to a compact JSON representation for unexpected shapes
      // so developers can still see the structure in console logs.
      return JSON.stringify(err, null, 2);
    } catch (_e) {
      // Defensive: if stringify itself throws for circular refs etc.
      return "An error occurred (failed to parse).";
    }
  };

  // Handle the submission of the sign-in form.
  // Flow:
  // 1. Prevent the browser default submit behavior.
  // 2. Ensure the Clerk client is loaded (`isLoaded`) before calling APIs.
  // 3. Clear previous errors and flip the `isSubmitting` flag for UI.
  // 4. Call `signIn.create` with the identifier/password.
  // 5. If the response is `complete`, activate the created session and
  //    navigate. Otherwise surface the status to the user.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) return;

    setError(null);
    setIsSubmitting(true);

    try {
      // `signIn.create` kicks off the sign-in flow with Clerk using the
      // provided identifier (email) and password. The returned object may
      // include multi-step status (e.g., needs OTP, needs verification, or
      // `complete` when a session is issued).
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      });

      if (signInAttempt.status === "complete") {
        // If Clerk returns `complete`, a session was created. We then
        // call `setActive` to make the session live in the client and
        // navigate the user. The `navigate` callback receives the session
        // object which can include `currentTask` for custom flow handling.
        await setActive({
          session: signInAttempt.createdSessionId,
          navigate: async ({session}) => {
            // Some sessions may include a `currentTask` that requires a
            // custom UI to finish (for example, completing MFA). If present
            // we log it here
            if (session?.currentTask) {
              console.log(session?.currentTask);
              return;
            }

            router.push("/");
          },
        });
      } else {
        // Non-`complete` statuses indicate the flow requires additional
        // steps (OTP, email verification, etc.). Surface a concise status
        // message to the user and log the full object for debugging.
        const msg = `Sign-in not complete: ${String(signInAttempt.status)}`;
        setError(msg);
        console.error(signInAttempt);
      }
    } catch (err: unknown) {
      // Parse and show a user-friendly error message. Full error is
      // logged for debugging purposes.
      const msg = getErrorMessage(err);
      setError(msg);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md mx-auto w-full bg-card/95 p-6 rounded-xl shadow-lg border border-border/40">
        <h1 className="text-2xl font-semibold mb-2 text-foreground">Sign in</h1>
        <p className="text-sm text-muted-foreground mb-4">
          Sign in to access your account and manage your memories.
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
            name="email"
            type="email"
            placeholder="you@domain.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full rounded-full px-4 py-2 border border-transparent bg-input text-foreground placeholder:opacity-60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
          />

          <label className="sr-only" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
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
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </div>

          <div id="clerk-captcha" />

          <div className="mt-4 text-center text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href={ROUTES["SIGN-UP"]}
              className="inline-block group ml-1 text-sm hover:text-foreground"
            >
              <span className="relative inline-block pb-0.5">
                Sign up
                <span className="absolute left-0 bottom-0 w-full h-[2px] bg-current transform scale-x-0 origin-center transition-transform duration-300 group-hover:scale-x-100" />
              </span>
            </Link>
            .
          </div>
        </form>
      </div>
    </main>
  );
}
