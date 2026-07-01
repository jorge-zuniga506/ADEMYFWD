"use client";

export default function DeleteForm({
  action,
  confirmMessage,
  className,
  children,
}: {
  action: () => Promise<void>;
  confirmMessage: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
      className={className}
    >
      {children}
    </form>
  );
}
