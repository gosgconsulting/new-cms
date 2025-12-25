"use client";

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { TenantSelector } from "./TenantSelector";
import FlowbiteComponentPreview from "./FlowbiteComponentPreview";
import type { Tenant } from "../../services/tenantService";
import type { ComponentSchema } from "../../services/tenantService";
import type { RegistryEntry } from "./ComponentGrid";

export interface ComponentPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selected: RegistryEntry | null;
  tenants: Tenant[];
  tenantIndex: number;
  tenantComponent: ComponentSchema | null;
  loadingTenantComp: boolean;
  onTenantSelect: (index: number) => void;
  onTenantPrev: () => void;
  onTenantNext: () => void;
}

/**
 * ComponentPreviewDialog Component
 * Dialog for previewing components with tenant selector
 */
export const ComponentPreviewDialog: React.FC<ComponentPreviewDialogProps> = ({
  open,
  onOpenChange,
  selected,
  tenants,
  tenantIndex,
  tenantComponent,
  loadingTenantComp,
  onTenantSelect,
  onTenantPrev,
  onTenantNext,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{selected?.title || selected?.id || "Component"}</span>
            <TenantSelector
              tenants={tenants}
              currentIndex={tenantIndex}
              onSelect={onTenantSelect}
              onPrev={onTenantPrev}
              onNext={onTenantNext}
            />
          </DialogTitle>
          {selected?.description ? (
            <DialogDescription>{selected.description}</DialogDescription>
          ) : null}
        </DialogHeader>

        <div className="mt-2">
          <div className="rounded-md border bg-white p-3">
            {loadingTenantComp ? (
              <div className="p-6 text-sm text-gray-500">Loading component from tenant...</div>
            ) : tenantComponent ? (
              <FlowbiteComponentPreview schema={tenantComponent as any} />
            ) : (
              <div className="space-y-3 p-6">
                <p className="text-sm text-gray-600">
                  No saved design found for this component in the selected tenant.
                </p>
                <div className="rounded-md border bg-gray-50 p-3">
                  {/* Fallback: show default registry preview to avoid blank modal */}
                  {selected && <FlowbiteComponentPreview schema={selected as any} />}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

