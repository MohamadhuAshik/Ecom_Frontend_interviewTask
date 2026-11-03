import HeroSection from "../components/home/HeroSection";
import ProductGrid from "../components/home/ProductGrid";

export default function HomePage() {
  return (
    <main className="w-full max-w-full overflow-x-hidden pt-16 sm:pt-20">
      <HeroSection />
      <ProductGrid />
    </main>
  );
}

