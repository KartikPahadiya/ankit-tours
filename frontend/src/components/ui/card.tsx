import type { HTMLAttributes, PropsWithChildren } from "react";

type DivProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>;

export function Card({ className = "", ...props }: DivProps) {
  return <div className={`rounded-2xl bg-white shadow-sm ${className}`} {...props} />;
}

export function CardHeader({ className = "", ...props }: DivProps) {
  return <div className={`p-6 ${className}`} {...props} />;
}

export function CardTitle({
  className = "",
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLHeadingElement>>) {
  return <h3 className={`text-lg font-semibold text-gray-900 ${className}`} {...props} />;
}

export function CardContent({ className = "", ...props }: DivProps) {
  return <div className={`px-6 pb-6 ${className}`} {...props} />;
}

export function CardFooter({ className = "", ...props }: DivProps) {
  return <div className={`px-6 pb-6 ${className}`} {...props} />;
}
