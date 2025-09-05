"use client";

import Link from "next/link";
import {useRouter} from "next/navigation";
import * as React from "react";

import {useSignIn} from "@clerk/nextjs";
import {OAuthStrategy} from "@clerk/types";

import AuthCard from "@/components/auth/auth-card";
import ErrorBanner from "@/components/auth/error-banner";
import GoogleLogo from "@/components/logos/google";
import PrimaryButton from "@/components/ui/primary-button";
import TextField from "@/components/ui/text-field";
import ROUTES from "@/constants/routes";
import formatError from "@/hooks/use-error-message";

import {Button} from "../ui/button";

export default function SignInFlow() {
  const {isLoaded, signIn, setActive} = useSignIn();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();

  const getErrorMessage = formatError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({
          session: signInAttempt.createdSessionId,
          navigate: async ({session}) => {
            if (session?.currentTask) {
              console.log(session?.currentTask);
              return;
            }

            router.push("/");
          },
        });
      } else {
        const msg = `Sign-in not complete: ${String(signInAttempt.status)}`;
        setError(msg);
        console.error(signInAttempt);
      }
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      setError(msg);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const signInWith = async (strategy: OAuthStrategy) => {
    if (!signIn) return;
    setError(null);

    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sign-in/sso-callback",
        redirectUrlComplete: ROUTES["HOME"],
      });
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      setError(msg);
      console.error(err);
    }
  };

  return (
    <AuthCard
      title="Sign in"
      subtitle="Sign in to access your account and manage your memories."
    >
      <Button
        onClick={() => signInWith("oauth_google")}
        variant="outline"
        size="default"
        className="w-full justify-center gap-3 py-2"
        type="button"
      >
        <GoogleLogo className="h-5 w-5" />
        <span className="font-medium">Sign in with Google</span>
      </Button>

      <div className="flex items-center my-4">
        <span className="flex-1 h-px bg-border/40 dark:bg-border/30" />
        <span className="mx-3 text-xs text-muted-foreground">OR</span>
        <span className="flex-1 h-px bg-border/40 dark:bg-border/30" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <ErrorBanner message={error} />

        <TextField
          id="email"
          name="email"
          type="email"
          placeholder="you@domain.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          label="Email address"
        />

        <TextField
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          label="Password"
        />

        <div className="flex items-center justify-between gap-3 mt-3">
          <div className="flex-1">
            <PrimaryButton type="submit" isLoading={isSubmitting}>
              Sign in
            </PrimaryButton>
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
    </AuthCard>
  );
}
