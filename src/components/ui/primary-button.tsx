import * as React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading?: boolean;
  loadingText?: string;
};

export default function PrimaryButton({
  children,
  isLoading,
  loadingText = "Loading...",
  disabled,
  ...rest
}: Props) {
  return (
    <button
      className="w-full rounded-full py-2 px-4 bg-gradient-to-r from-pink-500 to-pink-700 text-white font-medium shadow hover:opacity-95 active:opacity-90"
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? loadingText : children}
    </button>
  );
}
