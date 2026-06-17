import { Link } from "wouter";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

type ProductCardProps = {
  product: {
    handle: string;
    title: string;
    type: string;
    images: string[];
    variants: { price: number }[];
  };
  index?: number;
};

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const lowestPrice = Math.min(...product.variants.map((v) => v.price));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative bg-white rounded-lg border shadow-sm hover:shadow-md transition-all overflow-hidden"
    >
      <Link href={`/products/${product.handle}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-accent/20">
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 bg-white text-primary px-4 py-2 rounded-full font-medium shadow-sm transition-all transform translate-y-4 group-hover:translate-y-0">
              View Details
            </span>
          </div>
          <Badge className="absolute top-2 right-2 bg-white/90 text-primary border-primary/20 hover:bg-white">
            {product.type}
          </Badge>
        </div>
        <div className="p-4">
          <h3 className="font-heading font-medium text-[hsl(var(--card-foreground))] text-lg line-clamp-2 leading-tight mb-2">
            {product.title}
          </h3>
          <p className="text-secondary font-bold">
            Starting from ₹{lowestPrice}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
