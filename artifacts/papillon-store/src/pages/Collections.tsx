import { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/ui/ProductCard";
import productsData from "@/data/products.json";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

const allTypes = Array.from(new Set(productsData.map(p => p.type))).filter(Boolean);
const allSizes = Array.from(new Set(productsData.flatMap(p => p.variants.map(v => v.size))));

export default function Collections() {
  const params = useParams();
  const routeType = params.type;

  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedSize, setSelectedSize] = useState<string>("all");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    if (routeType) {
      const formattedType = routeType.replace(/-/g, " ");
      const matchingType = allTypes.find(
        (t) => t.toLowerCase() === formattedType.toLowerCase()
      );
      if (matchingType) setSelectedType(matchingType);
    } else {
      setSelectedType("all");
    }
  }, [routeType]);

  const filteredProducts = useMemo(() => {
    return productsData.filter((product) => {
      const matchesSearch = product.title.toLowerCase().includes(search.toLowerCase());
      const matchesType = selectedType === "all" || product.type === selectedType;
      const matchesSize = selectedSize === "all" || product.variants.some((v) => v.size === selectedSize);
      
      return matchesSearch && matchesType && matchesSize;
    });
  }, [search, selectedType, selectedSize]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="font-heading text-4xl font-bold text-primary">
              {routeType ? selectedType + "s" : "All Collections"}
            </h1>
            <p className="text-muted-foreground mt-2">
              Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <button 
              className="md:hidden px-4 py-2 bg-accent text-primary rounded-md font-medium"
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            >
              Filters
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className={`md:w-64 space-y-6 ${isMobileFiltersOpen ? 'block' : 'hidden md:block'}`}>
            <div className="bg-white p-6 rounded-lg border shadow-sm space-y-6">
              <div>
                <Label className="text-primary font-bold mb-3 block">Product Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {allTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-primary font-bold mb-3 block">Size</Label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Sizes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sizes</SelectItem>
                    {allSizes.map(size => (
                      <SelectItem key={size} value={size}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-lg border shadow-sm">
                <div className="text-6xl mb-4">🌸</div>
                <h3 className="font-heading text-2xl font-bold text-primary mb-2">No products found</h3>
                <p className="text-muted-foreground mb-6">Try adjusting your filters to find what you're looking for.</p>
                <button 
                  onClick={() => { setSearch(""); setSelectedType("all"); setSelectedSize("all"); }}
                  className="px-6 py-2 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
