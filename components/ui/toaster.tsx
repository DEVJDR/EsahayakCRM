"use client";

import * as React from "react";
import * as RadixToast from "@radix-ui/react-toast";
import { useToast } from "./use-toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <RadixToast.Provider swipeDirection="right">
      {toasts.map(({ id, title, description }) => (
        <RadixToast.Root
          key={id}
          className="bg-gray-900 text-white px-4 py-2 rounded-md shadow-lg mb-2"
        >
          {title && <RadixToast.Title>{title}</RadixToast.Title>}
          {description && (
            <RadixToast.Description>{description}</RadixToast.Description>
          )}
        </RadixToast.Root>
      ))}
      <RadixToast.Viewport className="fixed bottom-4 right-4 w-80" />
    </RadixToast.Provider>
  );
}
