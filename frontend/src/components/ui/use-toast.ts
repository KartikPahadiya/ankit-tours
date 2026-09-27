export type ToastPayload = {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
};

/**
 * Lightweight toast that appends a message to the DOM and auto-removes it.
 * No provider or <Toaster /> mount is required.
 */
export function toast({ title, description, variant }: ToastPayload) {
  if (typeof document === "undefined") return;

  const el = document.createElement("div");
  el.className = `fixed bottom-6 right-6 z-[100] max-w-sm rounded-xl border px-4 py-3 shadow-lg ${
    variant === "destructive"
      ? "border-red-200 bg-red-50 text-red-800"
      : "border-gray-200 bg-white text-gray-800"
  }`;

  const titleEl = document.createElement("div");
  titleEl.className = "text-sm font-semibold";
  titleEl.textContent = title;
  el.appendChild(titleEl);

  if (description) {
    const descEl = document.createElement("div");
    descEl.className = "mt-1 text-xs opacity-80";
    descEl.textContent = description;
    el.appendChild(descEl);
  }

  document.body.appendChild(el);
  window.setTimeout(() => el.remove(), 4000);
}

export function useToast() {
  return { toast };
}
