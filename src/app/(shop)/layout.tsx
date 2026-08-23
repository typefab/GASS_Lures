import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/CartProvider";
import PreviewBanner from "@/components/PreviewBanner";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <a
        href="#contenuto"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-brass focus:px-4 focus:py-2 focus:font-semibold focus:text-ink"
      >
        Vai al contenuto
      </a>
      <PreviewBanner />
      <Header />
      <main id="contenuto">{children}</main>
      <Footer />
    </CartProvider>
  );
}
