import * as React from "react";

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export default function AuthCard({title, subtitle, children, footer}: Props) {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md mx-auto w-full bg-card/95 p-6 rounded-xl shadow-lg border border-border/40">
        <h1 className="text-2xl font-semibold mb-2 text-foreground">{title}</h1>
        {subtitle ? (
          <p className="text-sm text-muted-foreground mb-4">{subtitle}</p>
        ) : null}

        {children}

        {footer ? <div className="mt-4">{footer}</div> : null}
      </div>
    </main>
  );
}
