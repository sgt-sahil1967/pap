import { Link } from "wouter";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Cart() {
  const { items, updateQuantity, removeFromCart, total, itemCount } = useCart();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
        <h1 className="font-heading text-4xl font-bold text-primary mb-8">Your Cart</h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border shadow-sm">
            <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-10 w-10 text-primary" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-3">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">Looks like you haven't added anything to your cart yet.</p>
            <Link href="/collections">
              <Button size="lg" className="rounded-full px-8 bg-secondary hover:bg-secondary/90">
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-6 bg-white p-4 rounded-xl border shadow-sm">
                  <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 bg-accent rounded-lg overflow-hidden border">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-heading text-lg font-bold text-primary leading-tight mb-1">
                          <Link href={`/products/${item.productId}`} className="hover:underline">
                            {item.title}
                          </Link>
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">Size: {item.size}</p>
                      </div>
                      <div className="text-lg font-bold text-foreground">
                        ₹{item.price * item.quantity}
                      </div>
                    </div>
                    
                    <div className="mt-auto flex justify-between items-center">
                      <div className="flex items-center gap-3 bg-accent/30 border rounded-full p-1">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-white rounded-full transition-colors"
                        >
                          <Minus className="h-4 w-4 text-foreground" />
                        </button>
                        <span className="w-6 text-center font-bold">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-white rounded-full transition-colors"
                        >
                          <Plus className="h-4 w-4 text-foreground" />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 text-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-6 md:p-8 rounded-2xl border shadow-sm h-max sticky top-24">
              <h2 className="font-heading text-2xl font-bold text-primary mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 text-foreground">
                <div className="flex justify-between">
                  <span>Subtotal ({itemCount} items)</span>
                  <span className="font-medium">₹{total}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-secondary font-medium">
                    {itemCount >= 2 ? "Free" : "Calculated at checkout"}
                  </span>
                </div>
                {itemCount < 2 && (
                  <p className="text-sm text-secondary bg-accent/30 p-3 rounded-lg mt-2">
                    🎉 Add {2 - itemCount} more item{2 - itemCount > 1 ? 's' : ''} to get Free Shipping!
                  </p>
                )}
              </div>
              
              <div className="border-t pt-4 mb-8">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total</span>
                  <span className="text-primary">₹{total}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-right">Tax included</p>
              </div>

              <Link href="/checkout">
                <Button className="w-full bg-secondary hover:bg-secondary/90 text-white rounded-full h-14 text-lg font-bold shadow-md hover:shadow-lg transition-all">
                  Proceed to Checkout
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
