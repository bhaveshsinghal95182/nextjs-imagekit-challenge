"use client";

import Link from "next/link";
import {useRouter} from "next/navigation";
import * as React from "react";

import {GoogleOneTap, useSignUp} from "@clerk/nextjs";

import AuthCard from "@/components/auth/auth-card";
import ErrorBanner from "@/components/auth/error-banner";
import OtpInput from "@/components/auth/otp-input";
import PrimaryButton from "@/components/ui/primary-button";
import TextField from "@/components/ui/text-field";
import ROUTES from "@/constants/routes";
import formatError from "@/hooks/use-error-message";

export default function SignUpFlow() {
  const {isLoaded, signUp, setActive} = useSignUp();
  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [verifying, setVerifying] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [code, setCode] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();

  const getErrorMessage = formatError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) return;

    setError(null);
    setIsSubmitting(true);
    try {
      await signUp.create({
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setVerifying(true);
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      setError(msg);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) return;

    setError(null);
    setIsSubmitting(true);
    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === "complete") {
        await setActive({
          session: signUpAttempt.createdSessionId,
          navigate: async ({session}) => {
            if (session?.currentTask) {
              console.log(session?.currentTask);
              return;
            }

            await router.push("/");
          },
        });
      } else {
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

  if (verifying) {
    return (
      <AuthCard
        title="Verify your email"
        subtitle="Enter the verification code we sent to your email address."
      >
        <form onSubmit={handleVerify} className="space-y-3">
          <ErrorBanner message={error} />

          <OtpInput value={code} onChange={setCode} />

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
      <GoogleOneTap />

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
