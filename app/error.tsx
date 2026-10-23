"use client";

export default function Error() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="text-sm text-neutral-500">Please reload the page. If it keeps happening, open this page in Safari or Chrome.</p>
      <button onClick={() => window.location.reload()} className="rounded-full bg-black px-5 py-2 text-sm text-white">
        Reload page
      </button>
    </main>
  );
}
