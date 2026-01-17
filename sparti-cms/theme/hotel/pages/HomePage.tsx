import React from "react";
import HeroSlider from "../components/rooms/HeroSlider";
import BookForm from "../components/booking/BookForm";
import Rooms from "../components/rooms/Rooms";
import ScrollToTop from "../utils/ScrollToTop";
import type { PageProps } from "../types";

const HomePage: React.FC<PageProps> = ({ themeSlug = "hotel" }) => {
  return (
    <div>
      <ScrollToTop />

      <HeroSlider />

      <div className="container mx-auto relative">
        <div className="bg-accent/20 mt-4 p-4 lg:absolute lg:left-0 lg:right-0 lg:p-0 lg:-top-12 lg:z-30 lg:shadow-xl">
          <BookForm />
        </div>
      </div>

      <Rooms themeSlug={themeSlug} />
    </div>
  );
};

export default HomePage;
