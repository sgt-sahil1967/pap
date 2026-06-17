import { useState, useMemo } from "react";
import { useParams, Link } from "wouter";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import productsData from "@/data/products.json";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Share2, Minus, Plus, ShoppingBag } from "lucide-react";

export default function ProductDetail() {
  const { handle } = useParams();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const product = useMemo(() => {
    return productsData.find((p) => p.handle === handle);
  }, [handle]);

  const [selectedSize, setSelectedSize] = useState<string>(
    product?.variants[0]?.size || ""
  );
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<number>(0);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-20 text-center">
          <h1 className="font-heading text-4xl text-primary font-bold mb-4">Product Not Found</h1>
          <p className="mb-8">We couldn't find the product you're looking for.</p>
          <Link href="/collections">
            <Button>Back to Collections</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const selectedVariant = product.variants.find((v) => v.size === selectedSize) || product.variants[0];

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      title: product.title,
      price: selectedVariant.price,
      size: selectedSize,
      quantity,
      image: product.images[0]
    });
    
    toast({
      title: "Added to Cart!",
      description: `${quantity}x ${product.title} (${selectedSize}) added to your cart.`,
      className: "bg-white border-primary",
    });
  };

  const shareProduct = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Product link copied to clipboard.",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-sm text-muted-foreground mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link href="/collections" className="hover:text-primary">Collections</Link>
          <span>/</span>
          <Link 
            href={`/collections/${product.type.toLowerCase().replace(/\s+/g, "-")}`}
            className="hover:text-primary"
          >
            {product.type}
          </Link>
          <span>/</span>
          <span className="text-foreground truncate">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-2xl overflow-hidden border shadow-sm">
              <img 
                src={product.images[selectedImage]} 
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === i ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <div className="mb-6">
              <Badge className="mb-4 bg-accent text-primary hover:bg-accent hover:text-primary border-none text-sm px-3 py-1">
                {product.type}
              </Badge>
              <h1 className="font-heading text-4xl font-bold text-primary mb-4 leading-tight">
                {product.title}
              </h1>
              <div className="text-3xl font-bold text-foreground">
                ₹{selectedVariant.price}
              </div>
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-foreground">Select Size</span>
                <span className="text-sm text-muted-foreground underline cursor-pointer hover:text-primary">Size Guide</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.variants.map((v) => (
                  <button
                    key={v.size}
                    onClick={() => setSelectedSize(v.size)}
                    className={`px-5 py-2.5 rounded-full border transition-all font-medium ${
                      selectedSize === v.size
                        ? "bg-primary text-white border-primary shadow-md"
                        : "bg-white text-foreground border-border hover:border-primary/50 hover:bg-accent/20"
                    }`}
                  >
                    {v.size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <span className="font-bold text-foreground block mb-3">Quantity</span>
              <div className="flex items-center gap-4 bg-white border rounded-full w-max p-1 shadow-sm">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-full transition-colors"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <span className="w-8 text-center font-bold text-lg">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-full transition-colors"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex gap-4 mt-auto">
              <Button 
                onClick={handleAddToCart}
                className="flex-1 bg-secondary hover:bg-secondary/90 text-white rounded-full h-14 text-lg font-bold shadow-md hover:shadow-lg transition-all"
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button 
                variant="outline" 
                onClick={shareProduct}
                className="h-14 w-14 rounded-full border-border text-primary hover:bg-accent hover:text-primary shrink-0"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
            
            {product.body && (
              <div className="mt-12 pt-8 border-t">
                <h3 className="font-heading text-xl font-bold text-primary mb-4">Product Description</h3>
                <div 
                  className="prose prose-purple max-w-none text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: product.body }}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
