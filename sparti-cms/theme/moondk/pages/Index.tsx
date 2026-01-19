import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import HeroSlider from "../components/content/HeroSlider";
import ProductCarousel from "../components/content/ProductCarousel";
import LargeHero from "../components/content/LargeHero";
import OneThirdTwoThirdsSection from "../components/content/OneThirdTwoThirdsSection";
import EditorialSection from "../components/content/EditorialSection";

const IndexPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <HeroSlider />
        <ProductCarousel />
        <LargeHero />
        <OneThirdTwoThirdsSection />
        <EditorialSection />
      </main>

      <Footer />
    </div>
  );
};

export default IndexPage;
