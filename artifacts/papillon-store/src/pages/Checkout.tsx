import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Check, ChevronRight, Loader2, ArrowLeft } from "lucide-react";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", 
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", 
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
  "Delhi", "Lakshadweep", "Puducherry", "Ladakh", "Jammu and Kashmir"
];

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian phone number"),
});

const shippingSchema = z.object({
  line1: z.string().min(5, "Address must be at least 5 characters"),
  line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, "Please enter a valid 6-digit Indian PIN code"),
});

type ContactFormValues = z.infer<typeof contactSchema>;
type ShippingFormValues = z.infer<typeof shippingSchema>;

export default function Checkout() {
  const { items, total, itemCount, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [contactData, setContactData] = useState<ContactFormValues | null>(null);
  const [shippingData, setShippingData] = useState<ShippingFormValues | null>(null);

  const contactForm = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: contactData || { name: "", email: "", phone: "" },
  });

  const shippingForm = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: shippingData || { line1: "", line2: "", city: "", state: "", pincode: "" },
  });

  // Calculate shipping cost
  const shippingCost = itemCount >= 2 ? 0 : 80;
  const finalTotal = total + shippingCost;

  if (items.length === 0) {
    setLocation("/cart");
    return null;
  }

  const onContactSubmit = (data: ContactFormValues) => {
    setContactData(data);
    setStep(2);
  };

  const onShippingSubmit = (data: ShippingFormValues) => {
    setShippingData(data);
    setStep(3);
  };

  const handlePayment = async () => {
    if (!contactData || !shippingData) return;
    
    setIsProcessing(true);
    try {
      // 1. Create order
      const orderPayload = {
        customer: contactData,
        shippingAddress: shippingData,
        items: items.map(item => ({
          productId: item.productId,
          title: item.title,
          size: item.size,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        subtotal: total,
        shippingCost,
        total: finalTotal,
      };

      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });
      
      if (!orderRes.ok) throw new Error("Failed to create order");
      const order = await orderRes.json();

      // 2. Initiate payment
      const paymentRes = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id || `order-${Date.now()}` }),
      });
      
      if (!paymentRes.ok) throw new Error("Failed to initiate payment");
      const payment = await paymentRes.json();
      
      // Clear cart
      clearCart();
      
      // Redirect to payment gateway
      if (payment.url) {
        window.location.href = payment.url;
      } else {
        // Fallback for mock environment
        setLocation(`/payment/status?txnId=${payment.txnId || 'mock-txn'}`);
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Payment Error",
        description: "Something went wrong while processing your payment. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
        <h1 className="font-heading text-4xl font-bold text-primary mb-8 text-center">Checkout</h1>
        
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-12 max-w-2xl mx-auto">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>1</div>
            <div className="text-sm font-medium ml-2 hidden sm:block">Contact</div>
          </div>
          <div className={`w-16 sm:w-24 h-1 mx-2 sm:mx-4 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>2</div>
            <div className="text-sm font-medium ml-2 hidden sm:block">Shipping</div>
          </div>
          <div className={`w-16 sm:w-24 h-1 mx-2 sm:mx-4 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 3 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>3</div>
            <div className="text-sm font-medium ml-2 hidden sm:block">Review</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="bg-white p-6 md:p-8 rounded-2xl border shadow-sm relative overflow-hidden">
              {/* Decorative top border */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-accent"></div>
              
              {/* STEP 1: CONTACT */}
              {step === 1 && (
                <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-accent text-primary p-2 rounded-lg"><ChevronRight className="w-5 h-5" /></div>
                    <h2 className="font-heading text-2xl font-bold text-foreground">Contact Information</h2>
                  </div>
                  
                  <form onSubmit={contactForm.handleSubmit(onContactSubmit)} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" placeholder="Priya Sharma" {...contactForm.register("name")} className="h-12" />
                      {contactForm.formState.errors.name && (
                        <p className="text-sm text-destructive">{contactForm.formState.errors.name.message}</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" placeholder="priya@example.com" {...contactForm.register("email")} className="h-12" />
                        {contactForm.formState.errors.email && (
                          <p className="text-sm text-destructive">{contactForm.formState.errors.email.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number (+91)</Label>
                        <Input id="phone" placeholder="9876543210" {...contactForm.register("phone")} className="h-12" />
                        {contactForm.formState.errors.phone && (
                          <p className="text-sm text-destructive">{contactForm.formState.errors.phone.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="pt-6 flex justify-end">
                      <Button type="submit" size="lg" className="rounded-full px-8 h-12 w-full sm:w-auto">
                        Continue to Shipping
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* STEP 2: SHIPPING */}
              {step === 2 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setStep(1)}>
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h2 className="font-heading text-2xl font-bold text-foreground">Shipping Address</h2>
                  </div>
                  
                  <form onSubmit={shippingForm.handleSubmit(onShippingSubmit)} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="line1">Address Line 1</Label>
                      <Input id="line1" placeholder="House/Flat No., Building Name, Street" {...shippingForm.register("line1")} className="h-12" />
                      {shippingForm.formState.errors.line1 && (
                        <p className="text-sm text-destructive">{shippingForm.formState.errors.line1.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="line2">Address Line 2 (Optional)</Label>
                      <Input id="line2" placeholder="Locality, Area, Landmark" {...shippingForm.register("line2")} className="h-12" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" placeholder="Mumbai" {...shippingForm.register("city")} className="h-12" />
                        {shippingForm.formState.errors.city && (
                          <p className="text-sm text-destructive">{shippingForm.formState.errors.city.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="pincode">PIN Code</Label>
                        <Input id="pincode" placeholder="400001" {...shippingForm.register("pincode")} className="h-12" />
                        {shippingForm.formState.errors.pincode && (
                          <p className="text-sm text-destructive">{shippingForm.formState.errors.pincode.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="state">State / Union Territory</Label>
                      <Select 
                        onValueChange={(val) => shippingForm.setValue("state", val)} 
                        defaultValue={shippingForm.getValues("state")}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select a state" />
                        </SelectTrigger>
                        <SelectContent className="max-h-80">
                          {INDIAN_STATES.map(state => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {shippingForm.formState.errors.state && (
                        <p className="text-sm text-destructive">{shippingForm.formState.errors.state.message}</p>
                      )}
                    </div>
                    
                    <div className="pt-6 flex justify-end">
                      <Button type="submit" size="lg" className="rounded-full px-8 h-12 w-full sm:w-auto">
                        Review Order
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* STEP 3: REVIEW */}
              {step === 3 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setStep(2)}>
                        <ArrowLeft className="w-5 h-5" />
                      </Button>
                      <h2 className="font-heading text-2xl font-bold text-foreground">Review Order</h2>
                    </div>
                  </div>
                  
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-accent/20 p-5 rounded-xl border border-accent">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-bold text-primary">Contact</h3>
                          <button onClick={() => setStep(1)} className="text-sm text-muted-foreground hover:text-primary underline">Edit</button>
                        </div>
                        <p className="text-sm">{contactData?.name}</p>
                        <p className="text-sm">{contactData?.email}</p>
                        <p className="text-sm">+91 {contactData?.phone}</p>
                      </div>
                      
                      <div className="bg-accent/20 p-5 rounded-xl border border-accent">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-bold text-primary">Shipping</h3>
                          <button onClick={() => setStep(2)} className="text-sm text-muted-foreground hover:text-primary underline">Edit</button>
                        </div>
                        <p className="text-sm truncate">{shippingData?.line1}</p>
                        {shippingData?.line2 && <p className="text-sm truncate">{shippingData?.line2}</p>}
                        <p className="text-sm">{shippingData?.city}, {shippingData?.state} {shippingData?.pincode}</p>
                      </div>
                    </div>
                    
                    <div className="pt-6 flex justify-end">
                      <Button 
                        onClick={handlePayment} 
                        size="lg" 
                        disabled={isProcessing}
                        className="rounded-full px-12 h-14 text-lg w-full sm:w-auto bg-secondary hover:bg-secondary/90 shadow-lg"
                      >
                        {isProcessing ? (
                          <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>
                        ) : (
                          <>Pay ₹{finalTotal} Now</>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ORDER SUMMARY SIDEBAR */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border shadow-sm h-max sticky top-24">
            <h2 className="font-heading text-2xl font-bold text-primary mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="relative">
                    <img src={item.image} alt={item.title} className="w-16 h-16 rounded-md object-cover border" />
                    <span className="absolute -top-2 -right-2 bg-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground">Size: {item.size}</p>
                  </div>
                  <p className="text-sm font-bold">₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>
            
            <div className="space-y-3 text-sm text-foreground pt-6 border-t">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium">₹{total}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                {shippingCost === 0 ? (
                  <span className="text-secondary font-medium uppercase text-xs tracking-wider pt-0.5">Free</span>
                ) : (
                  <span className="font-medium">₹{shippingCost}</span>
                )}
              </div>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total</span>
                <span className="text-primary">₹{finalTotal}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 text-right">Includes taxes</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
