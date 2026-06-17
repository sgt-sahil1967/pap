import { Link } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Header() {
  const { itemCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const productTypes = [
    "Cotton Frock",
    "Kurta Set",
    "Co-ord set",
    "Silk Frock",
    "Parkar Polka",
    "Paithani Frock",
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <div className="w-full bg-[#00af13] text-white text-center py-2 text-sm font-medium">
        Free Shipping On Any 2 Purchases! 🎉
      </div>
      
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <button
              className="mr-4 md:hidden"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu className="h-6 w-6 text-primary" />
            </button>
            <Link href="/" className="font-heading text-2xl font-bold text-primary">
              Papillon Ethinics
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            
            <div className="relative group">
              <Link href="/collections" className="text-foreground hover:text-primary transition-colors py-2">
                Collections
              </Link>
              <div className="absolute top-full left-0 hidden w-48 bg-white shadow-md border rounded-md py-2 group-hover:block">
                {productTypes.map((type) => (
                  <Link
                    key={type}
                    href={`/collections/${type.toLowerCase().replace(/\s+/g, "-")}`}
                    className="block px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-primary"
                  >
                    {type}
                  </Link>
                ))}
              </div>
            </div>

            <Link href="/about" className="text-foreground hover:text-primary transition-colors">
              About
            </Link>
          </nav>

          <div className="flex items-center">
            <Link href="/cart" className="relative p-2 text-primary hover:bg-accent rounded-full transition-colors">
              <ShoppingBag className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#00af13] text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50">
          <div className="fixed inset-y-0 left-0 w-3/4 max-w-sm bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-heading text-xl font-bold text-primary">Menu</span>
              <button onClick={() => setIsMenuOpen(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="flex flex-col space-y-2 px-4">
                <Link href="/" className="py-2 text-lg font-medium" onClick={() => setIsMenuOpen(false)}>
                  Home
                </Link>
                <Link href="/collections" className="py-2 text-lg font-medium" onClick={() => setIsMenuOpen(false)}>
                  All Collections
                </Link>
                
                <div className="pl-4 flex flex-col space-y-2 py-2 border-l-2 ml-2">
                  {productTypes.map((type) => (
                    <Link
                      key={type}
                      href={`/collections/${type.toLowerCase().replace(/\s+/g, "-")}`}
                      className="text-muted-foreground"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {type}
                    </Link>
                  ))}
                </div>

                <Link href="/about" className="py-2 text-lg font-medium" onClick={() => setIsMenuOpen(false)}>
                  About
                </Link>
              </nav>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
