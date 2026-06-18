import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Order = {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  created_at: string;
  total: number;
  status: string;
  payment_status: string;
};

const getStatusVariant = (status: string) => {
  switch (status) {
    case "delivered": return "success";
    case "cancelled": return "destructive";
    case "shipped": return "default";
    case "processing": return "warning";
    default: return "secondary";
  }
};

const tabs = ["all", "pending", "processing", "shipped", "delivered", "cancelled"];

export default function Orders() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  const load = async () => {
    setLoading(true);
    let query = supabase
      .from("orders")
      .select("id, order_number, customer_name, customer_email, created_at, total, status, payment_status")
      .order("created_at", { ascending: false });

    if (filter !== "all") query = query.eq("status", filter);
    if (search) {
      query = query.or(
        `order_number.ilike.%${search}%,customer_email.ilike.%${search}%,customer_name.ilike.%${search}%`
      );
    }

    const { data } = await query;
    setOrders((data ?? []) as Order[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
        <button
          onClick={load}
          className="flex items-center gap-1.5 px-3 py-2 text-sm border border-input rounded-md hover:bg-muted text-muted-foreground"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <Card>
        <div className="border-b px-4 flex gap-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`py-3 px-1 border-b-2 text-sm font-medium whitespace-nowrap ${
                filter === tab
                  ? "border-[#930497] text-[#930497]"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <CardHeader className="py-4">
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order # or email..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-muted-foreground text-sm">Loading…</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : orders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setLocation(`/orders/${order.id}`)}
                  >
                    <TableCell className="font-medium font-mono">{order.order_number}</TableCell>
                    <TableCell>
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <div>{order.customer_name}</div>
                      <div className="text-xs text-muted-foreground">{order.customer_email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={order.payment_status === "paid" ? "success" : "secondary"}>
                        {order.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ₹{Number(order.total).toLocaleString("en-IN")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
