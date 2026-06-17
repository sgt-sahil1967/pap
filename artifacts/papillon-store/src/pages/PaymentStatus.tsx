import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";

export default function PaymentStatus() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const txnId = searchParams.get("txnId");
  
  const [status, setStatus] = useState<"pending" | "success" | "failed">("pending");
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    if (!txnId) {
      setStatus("failed");
      return;
    }

    let pollCount = 0;
    const maxPolls = 10; // 30s total if every 3s
    
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/payments/status/${txnId}`);
        const data = await response.json();
        
        if (data.status === "SUCCESS") {
          setStatus("success");
          setOrderDetails(data.order);
        } else if (data.status === "FAILED") {
          setStatus("failed");
        } else {
          // Still pending
          pollCount++;
          if (pollCount >= maxPolls) {
            setStatus("failed"); // timeout
          } else {
            setTimeout(checkStatus, 3000);
          }
        }
      } catch (err) {
        console.error("Payment status check failed:", err);
        pollCount++;
        if (pollCount >= maxPolls) {
          setStatus("failed");
        } else {
          setTimeout(checkStatus, 3000);
        }
      }
    };

    checkStatus();
  }, [txnId]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-24 max-w-2xl flex flex-col items-center justify-center text-center">
        {status === "pending" && (
          <div className="space-y-6">
            <Loader2 className="w-20 h-20 text-primary animate-spin mx-auto" />
            <h1 className="font-heading text-3xl font-bold text-primary">Verifying Payment...</h1>
            <p className="text-muted-foreground text-lg">Please don't close or refresh this page.</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6 bg-white p-12 rounded-3xl border shadow-sm w-full animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="font-heading text-4xl font-bold text-primary">Payment Successful!</h1>
            <p className="text-muted-foreground text-lg">Thank you for your order.</p>
            {orderDetails && (
              <div className="bg-accent/30 p-6 rounded-xl my-8">
                <p className="font-medium text-foreground">Order Number: <span className="font-bold">{orderDetails.id || txnId}</span></p>
                <p className="text-sm text-muted-foreground mt-2">We've sent a confirmation email to you.</p>
              </div>
            )}
            <Link href="/collections">
              <Button size="lg" className="rounded-full px-8 h-14 text-lg">
                Continue Shopping <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        )}

        {status === "failed" && (
          <div className="space-y-6 bg-white p-12 rounded-3xl border shadow-sm w-full animate-in zoom-in duration-300">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-destructive" />
            </div>
            <h1 className="font-heading text-4xl font-bold text-destructive">Payment Failed</h1>
            <p className="text-muted-foreground text-lg mb-8">We could not process your payment at this time.</p>
            <div className="flex gap-4 justify-center">
              <Link href="/cart">
                <Button variant="outline" size="lg" className="rounded-full px-8 h-14">
                  Back to Cart
                </Button>
              </Link>
              <Link href="/checkout">
                <Button size="lg" className="rounded-full px-8 h-14 bg-primary hover:bg-primary/90 text-white">
                  Try Again
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
