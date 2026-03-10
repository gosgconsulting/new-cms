import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import HomePage from "../components/home/HomePage";

const IndexPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HomePage />
      <Footer />
    </div>
  );
};

export default IndexPage;