import type { ReactNode } from "react";

export default function AuthLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <main className="flex min-h-dvh w-full items-center justify-center px-4 py-10">
      {children}
    </main>
  );
}
