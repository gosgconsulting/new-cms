import { IconType } from "react-icons";

/**
 * Represents a hotel room facility/amenity
 */
export interface Facility {
  name: string;
  icon: IconType;
}

/**
 * Represents a hotel room with all its details
 */
export interface Room {
  id: number;
  name: string;
  description: string;
  facilities: Facility[];
  size: number;
  maxPerson: number;
  price: number;
  image: string;
  imageLg: string;
}

/**
 * Represents a slide in the hero slider
 */
export interface SliderData {
  id: number;
  title: string;
  bg: string;
  btnNext: string;
}

/**
 * Represents an item in a dropdown list (adults/kids)
 */
export interface DropdownItem {
  name: string;
}

/**
 * Represents a hotel rule
 */
export interface HotelRule {
  rules: string;
}

/**
 * Context type for room filtering and booking state
 */
export interface RoomContextType {
  rooms: Room[];
  loading: boolean;
  adults: string;
  setAdults: (value: string) => void;
  kids: string;
  setKids: (value: string) => void;
  handleCheck: (e: React.FormEvent) => void;
  resetRoomFilterData: () => void;
}

/**
 * Props for the main Hotel theme component
 */
export interface HotelThemeProps {
  basePath?: string;
  pageSlug?: string;
  tenantName?: string;
  tenantSlug?: string;
  tenantId?: string;
  designSystemTheme?: string;
}

/**
 * Props for Header component
 */
export interface HeaderProps {
  tenantName?: string;
  tenantSlug?: string;
  basePath?: string;
  onResetFilters?: () => void;
}

/**
 * Props for Footer component
 */
export interface FooterProps {
  tenantName?: string;
  tenantSlug?: string;
}

/**
 * Props for Room card component
 */
export interface RoomProps {
  room: Room;
  themeSlug?: string;
}

/**
 * Props for page components
 */
export interface PageProps {
  basePath?: string;
  tenantId?: string;
  tenantName?: string;
  themeSlug?: string;
}

/**
 * Props for RoomDetailsPage component
 */
export interface RoomDetailsPageProps extends PageProps {
  roomId: string;
}
