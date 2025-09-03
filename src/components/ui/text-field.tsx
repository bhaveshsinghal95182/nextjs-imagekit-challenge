import * as React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export default function TextField({label, className = "", ...rest}: Props) {
  return (
    <>
      {label ? (
        <label className="sr-only" htmlFor={rest.id}>{label}</label>
      ) : null}
      <input
        className={`w-full rounded-full px-4 py-2 border border-transparent bg-input text-foreground placeholder:opacity-60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition ${className}`}
        {...rest}
      />
    </>
  );
}
