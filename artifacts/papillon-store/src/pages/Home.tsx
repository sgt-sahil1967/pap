import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/ui/ProductCard";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { supabase, type StoreProduct } from "@/lib/supabase";

export default function Home() {
  const { config } = useSiteConfig();
  const { heroBanner } = config;

  const [featuredProducts, setFeaturedProducts] = useState<StoreProduct[]>([]);

  useEffect(() => {
    supabase
      .from("products")
      .select("*, product_variants(*)")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(8)
      .then(({ data }) => {
        if (data) setFeaturedProducts(data as StoreProduct[]);
      });
  }, []);

  const categories = [
    { name: "Cotton Frock", bg: "bg-pink-100" },
    { name: "Kurta Set", bg: "bg-blue-100" },
    { name: "Co-ord set", bg: "bg-green-100" },
    { name: "Silk Frock", bg: "bg-purple-100" },
    { name: "Parkar Polka", bg: "bg-yellow-100" },
    { name: "Paithani Frock", bg: "bg-orange-100" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero / Banner Section */}
        <Link href={heroBanner.linkUrl}>
          <section
            className="bg-accent/30 py-20 px-4 text-center cursor-pointer relative overflow-hidden"
            style={
              heroBanner.imageUrl
                ? {
                    backgroundImage: `url(${heroBanner.imageUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          >
            {heroBanner.imageUrl && (
              <div className="absolute inset-0 bg-white/50" />
            )}
            <div className="container mx-auto max-w-4xl relative z-10">
              <h1 className="font-heading text-5xl md:text-7xl font-bold text-primary mb-6">
                {heroBanner.heading}
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                {heroBanner.subheading}
              </p>
              <span className="inline-flex items-center justify-center bg-secondary hover:bg-secondary/90 text-white font-bold text-lg px-8 rounded-full h-14">
                {heroBanner.buttonText}
              </span>
            </div>
          </section>
        </Link>

        {/* Categories */}
        <section className="py-16 container mx-auto px-4">
          <h2 className="font-heading text-3xl font-bold text-center text-primary mb-12">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {categories.map((cat) => (
              <Link key={cat.name} href={`/collections/${cat.name.toLowerCase().replace(/\s+/g, "-")}`}>
                <div className={`${cat.bg} rounded-2xl p-8 text-center cursor-pointer hover:shadow-md transition-shadow group`}>
                  <h3 className="font-heading text-xl md:text-2xl font-bold text-primary group-hover:scale-105 transition-transform">
                    {cat.name}s
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-12">
              <h2 className="font-heading text-3xl font-bold text-primary">New Arrivals</h2>
              <Link href="/collections" className="text-secondary font-medium hover:underline">
                View All →
              </Link>
            </div>
            {featuredProducts.length === 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-lg aspect-square animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {featuredProducts.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      handle: product.handle,
                      title: product.title,
                      type: product.type,
                      images: product.images ?? [],
                      variants: product.product_variants.map((v) => ({ price: v.price })),
                    }}
                    index={i}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="bg-primary py-16 text-white text-center px-4">
          <div className="container mx-auto max-w-2xl">
            <h2 className="font-heading text-3xl font-bold mb-4">Join the Papillon Family</h2>
            <p className="mb-8 text-white/90">Sign up for our newsletter to get updates on new arrivals, special offers, and festive collections.</p>
            <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-6 py-3 rounded-full text-foreground outline-none focus:ring-2 focus:ring-secondary"
                required
              />
              <Button type="submit" className="bg-secondary hover:bg-secondary/90 text-white font-bold rounded-full px-8 py-3 h-auto">
                Subscribe
              </Button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
