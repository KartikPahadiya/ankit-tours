import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;

export function Button({ className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition ${className}`}
      {...props}
    />
  );
}
