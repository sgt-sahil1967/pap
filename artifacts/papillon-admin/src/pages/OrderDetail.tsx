import { useState } from "react";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Save } from "lucide-react";

export default function OrderDetail() {
  const [, params] = useRoute("/orders/:id");
  const [status, setStatus] = useState("processing");

  const order = {
    id: params?.id || "ORD-1001",
    date: "Oct 25, 2023 at 2:30 PM",
    customer: {
      name: "Alice Cooper",
      email: "alice@example.com",
      phone: "+91 98765 43210",
      address: "123 Main St, Apartment 4B\nMumbai, Maharashtra 400001\nIndia"
    },
    payment: {
      status: "paid",
      transactionId: "txn_8x923nf82nf",
      method: "Credit Card (Stripe)"
    },
    items: [
      { id: 1, name: "Blue Denim Kurta", variant: "Medium", price: 1200, qty: 2, total: 2400 },
      { id: 2, name: "Silk Dupatta", variant: "Red", price: 1800, qty: 1, total: 1800 }
    ],
    subtotal: 4200,
    shipping: 100,
    total: 4300
  };

  const handleSave = () => {
    alert(`Order status updated to: ${status}`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex items-center gap-4">
        <Link href="/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Order {order.id}</h2>
        <Badge className="ml-2" variant="secondary">{order.date}</Badge>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* Items */}
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
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.variant}</div>
                      </TableCell>
                      <TableCell className="text-right">₹{item.price}</TableCell>
                      <TableCell className="text-center">{item.qty}</TableCell>
                      <TableCell className="text-right font-medium">₹{item.total}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-0">
                    <TableCell colSpan={3} className="text-right text-muted-foreground">Subtotal</TableCell>
                    <TableCell className="text-right">₹{order.subtotal}</TableCell>
                  </TableRow>
                  <TableRow className="border-0">
                    <TableCell colSpan={3} className="text-right text-muted-foreground">Shipping</TableCell>
                    <TableCell className="text-right">₹{order.shipping}</TableCell>
                  </TableRow>
                  <TableRow className="border-0 bg-muted/20">
                    <TableCell colSpan={3} className="text-right font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold text-lg">₹{order.total}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader><CardTitle>Payment Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center border-b pb-4">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="success" className="uppercase">{order.payment.status}</Badge>
              </div>
              <div className="flex justify-between items-center border-b pb-4">
                <span className="text-muted-foreground">Method</span>
                <span className="font-medium">{order.payment.method}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-mono text-sm">{order.payment.transactionId}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Status Update */}
          <Card>
            <CardHeader><CardTitle>Order Status</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Status</label>
                <select 
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <Button className="w-full gap-2" onClick={handleSave}>
                <Save size={16} /> Update Status
              </Button>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium">{order.customer.name}</h4>
                <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
              </div>
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-1 text-sm">Shipping Address</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {order.customer.address}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
