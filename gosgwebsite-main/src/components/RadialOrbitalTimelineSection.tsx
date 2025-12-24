"use client";
import React from "react";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";
import { Calendar, Code, FileText, User, Clock, Zap, Link as LinkIcon } from "lucide-react";

interface ItemNode {
  key: string;
  type: string;
  items?: Array<{ key: string; type: string; content?: string }>;
}

interface Props {
  items?: Array<ItemNode | any>;
}

/**
 * RadialOrbitalTimelineSection
 * Maps DynamicPageRenderer items into timelineData for the RadialOrbitalTimeline UI component.
 */
const iconMap: Record<string, React.ElementType> = {
  Calendar,
  Code,
  FileText,
  User,
  Clock,
  Zap,
  Link: LinkIcon,
};

const RadialOrbitalTimelineSection: React.FC<Props> = ({ items = [] }) => {
  const nodesArray = items.find((i: any) => i.key === "timelineData")?.items || [];

  const timelineData = nodesArray.map((node: any, idx: number) => {
    const nItems = node.items || [];
    const idItem = nItems.find((i: any) => i.key === "id");
    const titleItem = nItems.find((i: any) => i.key === "title");
    const dateItem = nItems.find((i: any) => i.key === "date");
    const contentItem = nItems.find((i: any) => i.key === "content");
    const categoryItem = nItems.find((i: any) => i.key === "category");
    const iconItem = nItems.find((i: any) => i.key === "icon");
    const relatedIdsItem = nItems.find((i: any) => i.key === "relatedIds");
    const statusItem = nItems.find((i: any) => i.key === "status");
    const energyItem = nItems.find((i: any) => i.key === "energy");

    const iconName = iconItem?.content || "Calendar";
    const IconComp = iconMap[iconName] || Calendar;

    const relatedIds = relatedIdsItem?.content
      ? Array.isArray(relatedIdsItem.content)
        ? relatedIdsItem.content
        : String(relatedIdsItem.content)
            .split(",")
            .map((v) => parseInt(v.trim(), 10))
            .filter((v) => !Number.isNaN(v))
      : [];

    return {
      id: idItem?.content ? parseInt(String(idItem.content), 10) : idx + 1,
      title: titleItem?.content || "",
      date: dateItem?.content || "",
      content: contentItem?.content || "",
      category: categoryItem?.content || "",
      icon: IconComp,
      relatedIds,
      status: (statusItem?.content || "pending") as "completed" | "in-progress" | "pending",
      energy: energyItem?.content ? parseInt(String(energyItem.content), 10) : 50,
    };
  });

  return <RadialOrbitalTimeline timelineData={timelineData} />;
};

export default RadialOrbitalTimelineSection;