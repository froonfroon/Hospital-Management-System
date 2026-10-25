"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Drawer = DialogPrimitive.Root;
const DrawerTrigger = DialogPrimitive.Trigger;
const DrawerClose = DialogPrimitive.Close;
const DrawerPortal = DialogPrimitive.Portal;

const DrawerOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs transition-opacity duration-300",
      className
    )}
    {...props}
  />
));
DrawerOverlay.displayName = "DrawerOverlay";

const DrawerContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    side?: "left" | "right";
  }
>(({ className, children, side = "right", ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-y-0 z-50 flex h-full flex-col border-slate-200 bg-white p-5 shadow-2xl transition ease-in-out duration-300 w-full sm:max-w-md",
        side === "right"
          ? "end-0 border-s data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right"
          : "start-0 border-e data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex-1">{/* Title insertion point */}</div>
        <DialogPrimitive.Close className="rounded-sm p-1 text-slate-400 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-600">
          <X className="h-4 w-4" />
          <span className="sr-only">Close drawer</span>
        </DialogPrimitive.Close>
      </div>
      <div className="flex-1 overflow-y-auto pt-3">{children}</div>
    </DialogPrimitive.Content>
  </DrawerPortal>
));
DrawerContent.displayName = "DrawerContent";

export { Drawer, DrawerTrigger, DrawerClose, DrawerContent };
