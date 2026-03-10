import type { DropdownItem, SliderData, HotelRule } from "../types";

export const adultsList: DropdownItem[] = [
  { name: "1 Adult" },
  { name: "2 Adults" },
  { name: "3 Adults" },
  { name: "4 Adults" },
];

export const kidsList: DropdownItem[] = [
  { name: "0 Kid" },
  { name: "1 Kid" },
  { name: "2 Kids" },
  { name: "3 Kids" },
  { name: "4 Kids" },
];

export const sliderData: SliderData[] = [
  {
    id: 1,
    title: "Your Luxury Hotel For Vacation",
    bg: "/theme/hotel/assets/hero/1.jpg",
    btnNext: "See our rooms",
  },
  {
    id: 2,
    title: "Feel Relax & Enjoy Your Luxuriousness",
    bg: "/theme/hotel/assets/hero/2.jpg",
    btnNext: "See our rooms",
  },
  {
    id: 3,
    title: "Your Luxury Hotel For Vacation",
    bg: "/theme/hotel/assets/hero/3.jpg",
    btnNext: "See our rooms",
  },
];

export const hotelRules: HotelRule[] = [
  {
    rules: "Check-in : 3:00 PM - 9:00 PM",
  },
  {
    rules: "Check-out : 10:30 AM",
  },
  {
    rules: "No Smoking",
  },
  {
    rules: "No Pet",
  },
];
