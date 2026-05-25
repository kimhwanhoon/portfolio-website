"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { IconX } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ModalShellProps {
  children: React.ReactNode;
}

export function ModalShell({ children }: ModalShellProps) {
  const router = useRouter();

  function handleOpenChange(open: boolean) {
    if (!open) {
      router.back();
    }
  }

  return (
    <DialogPrimitive.Root open onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Popup
          className={cn(
            "fixed z-50 outline-none",
            "max-sm:inset-0 max-sm:h-full max-sm:w-full max-sm:rounded-none",
            "sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2",
            "sm:w-full sm:max-w-3xl sm:max-h-[90vh] sm:rounded-xl",
            "overflow-y-auto bg-white p-6 shadow-xl",
            "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
            "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          )}
        >
          <DialogPrimitive.Close
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute top-4 right-4 z-10"
              />
            }
          >
            <IconX />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
          {children}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
