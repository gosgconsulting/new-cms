import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface SimplePricingSectionProps {
  items?: Array<{
    key: string;
    type: string;
    content?: string;
    items?: Array<{
      key: string;
      type: string;
      items?: Array<{
        key: string;
        type: string;
        content?: string;
      }>;
    }>;
  }>;
}

/**
 * SimplePricingSection
 * Renders: title, intro copy, and simple pricing list (name — price — note) with basic buttons.
 */
const SimplePricingSection: React.FC<SimplePricingSectionProps> = ({ items = [] }) => {
  const titleItem = items.find((i) => i.key === "title" && i.type === "heading") || items.find((i) => i.type === "heading");
  const introItem = items.find((i) => i.key === "intro" && i.type === "text");
  const cardsItem = items.find((i) => i.key === "cards" && i.type === "array");
  const cards = cardsItem?.items || [];

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {titleItem?.content && (
          <h2 className="text-2xl font-semibold mb-4">{titleItem.content}</h2>
        )}
        {introItem?.content && (
          <p className="text-base text-foreground/90 mb-6">{introItem.content}</p>
        )}

        <div className="space-y-6">
          {cards.map((card) => {
            const name = card.items?.find((c) => c.key === "name");
            const price = card.items?.find((c) => c.key === "price");
            const note = card.items?.find((c) => c.key === "note");
            const planName = name?.content || "";
            
            return (
              <div key={card.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                <div className="flex-1">
                  <div className="text-base">
                    <span className="font-semibold text-lg">{name?.content}</span>
                    {" — "}
                    <span className="font-medium text-brandPurple">{price?.content}</span>
                    {note?.content && note.content !== "To Be Decided" && (
                      <>
                        {" — "}
                        <span className="text-muted-foreground">{note.content}</span>
                      </>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="ml-4 border-brandPurple text-brandPurple hover:bg-brandPurple hover:text-white"
                >
                  Get Started
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SimplePricingSection;