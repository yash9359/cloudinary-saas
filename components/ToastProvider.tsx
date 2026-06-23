"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          background: "#18181b",
          color: "#fafafa",
          border: "1px solid #27272a",
        },
      }}
    />
  );
}