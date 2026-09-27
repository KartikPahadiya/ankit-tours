import {
  createContext,
  useContext,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type PropsWithChildren,
  type ReactNode,
} from "react";

type OptionValue = string | number;

type SelectedOption = { value: OptionValue; label: ReactNode } | null;

type SelectContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  selected: SelectedOption;
  select: (value: OptionValue, label: ReactNode) => void;
};

const SelectContext = createContext<SelectContextValue | null>(null);

export function Select({
  className = "",
  children,
  onValueChange,
  ...props
}: PropsWithChildren<
  HTMLAttributes<HTMLDivElement> & {
    onValueChange?: (value: OptionValue) => void;
  }
>) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<SelectedOption>(null);

  return (
    <SelectContext.Provider
      value={{
        open,
        setOpen,
        selected,
        select: (value, label) => {
          setSelected({ value, label });
          setOpen(false);
          onValueChange?.(value);
        },
      }}
    >
      <div className={`relative ${className}`} {...props}>
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({
  className = "",
  children,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  const ctx = useContext(SelectContext);
  return (
    <button
      type="button"
      onClick={() => ctx?.setOpen(!ctx.open)}
      className={`flex w-full items-center justify-between rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function SelectValue({
  placeholder,
  className = "",
}: {
  placeholder?: string;
  className?: string;
}) {
  const ctx = useContext(SelectContext);
  return (
    <span className={className}>
      {ctx?.selected ? ctx.selected.label : (placeholder ?? "")}
    </span>
  );
}

export function SelectContent({
  className = "",
  children,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  const ctx = useContext(SelectContext);
  if (!ctx?.open) return null;
  return (
    <div
      className={`absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white p-1 shadow-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function Option({
  value,
  className = "",
  children,
  ...props
}: PropsWithChildren<
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value"> & { value: OptionValue }
>) {
  const ctx = useContext(SelectContext);
  return (
    <button
      type="button"
      onClick={() => ctx?.select(value, children)}
      className={`block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-orange-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
