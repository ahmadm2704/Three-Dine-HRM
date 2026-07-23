"use client";

import OrgChartComponent from "@/components/OrgChart";
import { ThreeDPageHeader } from "@/components/ui/ThreeDPageHeader";
import { ThreeDCard } from "@/components/ui/ThreeDCard";

export default function OrgChartPage() {
  return (
    <div className="space-y-6">
      <ThreeDPageHeader
        title="Organizational Tree & Hierarchy"
        subtitle="Visual reporting structure, department nodes, and drag-and-drop management."
        badge="Hierarchy Mesh"
      />
      
      <ThreeDCard glowColor="blue">
        <div className="p-2">
          <OrgChartComponent />
        </div>
      </ThreeDCard>
    </div>
  );
}
