import type { InputHTMLAttributes } from "react";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 ${className}`}
      {...props}
    />
  );
}
