import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, ArrowRight, Package } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Order = {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total: number;
  status: string;
};

export default function PaymentStatus() {
  const searchParams = new URLSearchParams(window.location.search);
  const txnId = searchParams.get("txnId");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!txnId) { setLoading(false); return; }
    supabase
      .from("orders")
      .select("id, order_number, customer_name, customer_email, total, status")
      .eq("order_number", txnId)
      .maybeSingle()
      .then(({ data }) => {
        setOrder(data as Order ?? null);
        setLoading(false);
      });
  }, [txnId]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-24 max-w-2xl flex flex-col items-center justify-center text-center">
        {loading ? (
          <div className="space-y-6">
            <Loader2 className="w-20 h-20 text-primary animate-spin mx-auto" />
            <h1 className="font-heading text-3xl font-bold text-primary">Loading Order…</h1>
          </div>
        ) : (
          <div className="space-y-6 bg-white p-12 rounded-3xl border shadow-sm w-full animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="font-heading text-4xl font-bold text-primary">Order Placed!</h1>
            <p className="text-muted-foreground text-lg">
              Thank you for your order. We'll confirm your payment and start processing shortly.
            </p>

            {order && (
              <div className="bg-accent/30 p-6 rounded-xl my-8 text-left space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-primary">Order Summary</span>
                </div>
                <p className="text-sm">
                  <span className="text-muted-foreground">Order #:</span>{" "}
                  <span className="font-bold font-mono">{order.order_number}</span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Name:</span>{" "}
                  <span className="font-medium">{order.customer_name}</span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Email:</span>{" "}
                  <span className="font-medium">{order.customer_email}</span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Total:</span>{" "}
                  <span className="font-bold">₹{Number(order.total).toLocaleString("en-IN")}</span>
                </p>
                <p className="text-sm mt-2 text-muted-foreground">
                  A confirmation will be sent to your email address.
                </p>
              </div>
            )}

            <Link href="/collections">
              <Button size="lg" className="rounded-full px-8 h-14 text-lg">
                Continue Shopping <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
