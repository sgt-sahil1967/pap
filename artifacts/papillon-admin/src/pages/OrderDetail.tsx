import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";

type OrderItem = {
  title: string; size: string; price: number; quantity: number; image?: string;
};

type ShippingAddress = {
  line1: string; line2?: string; city: string; state: string; pincode: string; country: string;
};

type Order = {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  payment_status: string;
  notes: string | null;
  created_at: string;
};

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function OrderDetail() {
  const [, params] = useRoute("/orders/:id");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    supabase
      .from("orders")
      .select("*")
      .eq("id", params.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setOrder(data as Order);
          setStatus(data.status);
          setNotes(data.notes ?? "");
        }
        setLoading(false);
      });
  }, [params?.id]);

  const handleSave = async () => {
    if (!order) return;
    setSaving(true);
    await supabase
      .from("orders")
      .update({ status, notes: notes || null })
      .eq("id", order.id);
    setOrder((prev) => prev ? { ...prev, status, notes: notes || null } : prev);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading…</div>;
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground mb-4">Order not found.</p>
        <Link href="/orders"><Button>Back to Orders</Button></Link>
      </div>
    );
  }

  const addr = order.shipping_address ?? {};

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex items-center gap-4">
        <Link href="/orders">
          <Button variant="ghost" size="icon"><ArrowLeft size={20} /></Button>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Order {order.order_number}</h2>
        <Badge className="ml-2" variant="secondary">
          {new Date(order.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Order Items</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(order.items ?? []).map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.size}</div>
                      </TableCell>
                      <TableCell className="text-right">₹{item.price}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right font-medium">₹{item.price * item.quantity}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-0">
                    <TableCell colSpan={3} className="text-right text-muted-foreground">Subtotal</TableCell>
                    <TableCell className="text-right">₹{Number(order.subtotal).toLocaleString("en-IN")}</TableCell>
                  </TableRow>
                  <TableRow className="border-0">
                    <TableCell colSpan={3} className="text-right text-muted-foreground">Shipping</TableCell>
                    <TableCell className="text-right">
                      {Number(order.shipping) === 0 ? "Free" : `₹${Number(order.shipping).toLocaleString("en-IN")}`}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-0 bg-muted/20">
                    <TableCell colSpan={3} className="text-right font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold text-lg">₹{Number(order.total).toLocaleString("en-IN")}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Payment Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center border-b pb-4">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={order.payment_status === "paid" ? "success" : "secondary"} className="uppercase">
                  {order.payment_status}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Order Number</span>
                <span className="font-mono text-sm">{order.order_number}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Order Status</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Internal notes…"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <Button className="w-full gap-2" onClick={handleSave} disabled={saving}>
                <Save size={16} /> {saving ? "Saving…" : saved ? "Saved!" : "Update Status"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium">{order.customer_name}</h4>
                <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
              </div>
              {addr.line1 && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-1 text-sm">Shipping Address</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {addr.line1}
                    {addr.line2 && <>, {addr.line2}</>}<br />
                    {addr.city}, {addr.state} {addr.pincode}<br />
                    {addr.country}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
