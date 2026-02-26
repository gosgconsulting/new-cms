/**
 * Section contracts: expected item keys and shapes for Flowbite (and other) preview/components.
 * Use this when generating or validating new tenant page schema so layout renders correctly.
 *
 * AI schema generation: Prefer section types and structure from reference schema
 * sparti-cms/types/jp-b2b-home.json (HeroSection, Showcase, ProductGrid, SocialMedia,
 * ContentSection, ServicesGrid, Reviews, etc.). Generated schema should follow these contracts.
 *
 * Option B: All array item fields are TOP-LEVEL on the item (not in props). Editors and
 * preview components should read/write these keys so saved JSON matches the schema.
 *
 * @see schema.ts for TypeScript types (SchemaItem, ComponentSchema).
 */

export interface SectionContract {
  /** Section/component type (e.g. "FAQSection"). */
  type: string;
  /** Expected item key(s) for the main array in this section (first match used by preview). */
  arrayKeys: string[];
  /** Expected item key(s) for the primary CTA/button (first match used). */
  buttonKeys: string[];
  /** Optional: expected key for the section title (heading). */
  titleKey?: string;
  /** Optional: expected key for description/subtitle text. */
  descriptionKey?: string;
  /** Optional: expected key for main image. */
  imageKey?: string;
  /**
   * Shape of each array item: keys are top-level field names on the item.
   * Editors must read/write these at top-level so saved JSON matches the schema.
   */
  arrayItemShape?: Record<string, string>;
  /** If true, array item fields are stored at top-level (default true). */
  arrayItemKeysTopLevel?: boolean;
}

/**
 * Contracts by section type (normalized lowercase for lookup).
 * Add or extend entries when adding new section types or preview components.
 */
export const SECTION_CONTRACTS: Record<string, SectionContract> = {
  herosection: {
    type: "HeroSection",
    arrayKeys: [],
    buttonKeys: ["cta", "primaryCta"],
    titleKey: "title",
    descriptionKey: "description",
    imageKey: "image",
  },
  aboutsection: {
    type: "AboutSection",
    arrayKeys: ["features"],
    buttonKeys: ["button"],
    titleKey: "title",
    descriptionKey: "description",
    imageKey: "image",
    arrayItemShape: { title: "title", description: "description" },
    arrayItemKeysTopLevel: true,
  },
  featuressection: {
    type: "FeaturesSection",
    arrayKeys: ["features"],
    buttonKeys: [],
    titleKey: "title",
    descriptionKey: "subtitle",
    arrayItemShape: { title: "title", description: "description" },
    arrayItemKeysTopLevel: true,
  },
  programmessection: {
    type: "ProgrammesSection",
    arrayKeys: ["programmes"],
    buttonKeys: ["button"],
    titleKey: "title",
    descriptionKey: "description",
    imageKey: "image",
    arrayItemShape: { title: "title", description: "description" },
    arrayItemKeysTopLevel: true,
  },
  /**
   * GallerySection: "tabs" = tab labels (and optional value); "gallery" = image items.
   * - tabs: array of { key, type: "text"|"tab", content (label), value? }. value is the tab value for filtering (e.g. "all", "group-class"). If omitted, derive from key (e.g. "tab-group-class" -> "group-class", "tab-all" -> "all").
   * - gallery: array of { key, type: "image", src, alt, category? }. category matches a tab value; when a tab is selected, show images where category === tab.value (or show all when tab.value === "all").
   */
  gallerysection: {
    type: "GallerySection",
    arrayKeys: ["tabs", "gallery"],
    buttonKeys: [],
    titleKey: "title",
    descriptionKey: "description",
    arrayItemShape: { content: "content", value: "value", src: "src", alt: "alt", category: "category" },
    arrayItemKeysTopLevel: true,
  },
  testimonialssection: {
    type: "TestimonialsSection",
    arrayKeys: ["testimonials", "reviews"],
    buttonKeys: [],
    titleKey: "title",
    descriptionKey: "subtitle",
    arrayItemShape: { text: "text", name: "name", role: "role" },
    arrayItemKeysTopLevel: true,
  },
  teamsection: {
    type: "TeamSection",
    arrayKeys: ["teamMembers"],
    buttonKeys: [],
    titleKey: "title",
    descriptionKey: "description",
    arrayItemShape: { name: "name", role: "role", description: "description", src: "src", alt: "alt" },
    arrayItemKeysTopLevel: true,
  },
  faqsection: {
    type: "FAQSection",
    arrayKeys: ["faqItems"],
    buttonKeys: ["button"],
    titleKey: "title",
    descriptionKey: "subtitle",
    arrayItemShape: { question: "question", answer: "answer" },
    arrayItemKeysTopLevel: true,
  },
  ctasection: {
    type: "CTASection",
    arrayKeys: [],
    buttonKeys: ["cta"],
    titleKey: "title",
    descriptionKey: "description",
  },
  // --- Section types from jp-b2b-home.json (Julia Paris / reference schema for AI schema generation) ---
  showcase: {
    type: "Showcase",
    arrayKeys: ["categoryGrids", "items", "showcase"],
    buttonKeys: ["button"],
    titleKey: "title",
    descriptionKey: "description",
    arrayItemKeysTopLevel: true,
  },
  productgrid: {
    type: "ProductGrid",
    arrayKeys: ["buttons"],
    buttonKeys: [],
    titleKey: "title",
    descriptionKey: "description",
    arrayItemKeysTopLevel: true,
  },
  socialmedia: {
    type: "SocialMedia",
    arrayKeys: [],
    buttonKeys: [],
    titleKey: "title",
    descriptionKey: "subtitle",
  },
  contentsection: {
    type: "ContentSection",
    arrayKeys: ["content"],
    buttonKeys: ["button"],
    titleKey: "title",
    descriptionKey: "description",
    imageKey: "backgroundImage",
    arrayItemKeysTopLevel: true,
  },
  servicesgrid: {
    type: "ServicesGrid",
    arrayKeys: ["services"],
    buttonKeys: [],
    titleKey: "title",
    descriptionKey: "subtitle",
    arrayItemKeysTopLevel: true,
  },
  reviews: {
    type: "Reviews",
    arrayKeys: ["reviews"],
    buttonKeys: [],
    titleKey: "title",
    descriptionKey: "subtitle",
    arrayItemShape: { name: "name", content: "content", rating: "rating" },
    arrayItemKeysTopLevel: true,
  },
};

const normalizedCache: Record<string, SectionContract> = {};

/**
 * Get the contract for a section type (case-insensitive).
 */
export function getSectionContract(sectionType: string): SectionContract | undefined {
  const key = (sectionType || "").toLowerCase().trim();
  if (normalizedCache[key]) return normalizedCache[key];
  const entry = Object.entries(SECTION_CONTRACTS).find(([k]) => key.includes(k) || k.includes(key));
  if (entry) {
    normalizedCache[key] = entry[1];
    return entry[1];
  }
  return undefined;
}

/**
 * Preferred array key for a section type (for use when generating new schema).
 */
export function getArrayKeyForSection(sectionType: string): string | null {
  const contract = getSectionContract(sectionType);
  return contract?.arrayKeys?.[0] ?? null;
}

/**
 * Preferred button key for a section type (for use when generating new schema).
 */
export function getButtonKeyForSection(sectionType: string): string | null {
  const contract = getSectionContract(sectionType);
  return contract?.buttonKeys?.[0] ?? null;
}
