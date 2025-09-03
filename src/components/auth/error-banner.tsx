export default function ErrorBanner({message}: {message?: string | null}) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="rounded-md bg-red-50 border border-red-200 p-2 text-sm text-red-700"
    >
      {message}
    </div>
  );
}
