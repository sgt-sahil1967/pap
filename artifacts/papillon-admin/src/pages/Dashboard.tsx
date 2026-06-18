import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package, ShoppingCart, DollarSign, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";

type RecentOrder = {
  id: number;
  order_number: string;
  customer_name: string;
  total: number;
  status: string;
  payment_status: string;
  created_at: string;
};

type LowStockItem = {
  id: number;
  size: string;
  inventory_qty: number;
  inventory_reserved: number;
  products: { title: string } | null;
};

export default function Dashboard() {
  const [totalOrders, setTotalOrders] = useState<number | null>(null);
  const [revenue, setRevenue] = useState<number | null>(null);
  const [totalProducts, setTotalProducts] = useState<number | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);

  useEffect(() => {
    async function load() {
      const [ordersRes, productsRes, recentRes, inventoryRes] = await Promise.all([
        supabase.from("orders").select("total", { count: "exact" }),
        supabase.from("products").select("id", { count: "exact" }),
        supabase.from("orders").select("id, order_number, customer_name, total, status, payment_status, created_at")
          .order("created_at", { ascending: false }).limit(5),
        supabase.from("product_variants")
          .select("id, size, inventory_qty, inventory_reserved, products(title)")
          .lt("inventory_qty", 5)
          .order("inventory_qty", { ascending: true })
          .limit(5),
      ]);

      if (ordersRes.data) {
        setTotalOrders(ordersRes.count ?? 0);
        setRevenue(ordersRes.data.reduce((sum: number, o: { total: number }) => sum + Number(o.total), 0));
      }
      if (productsRes.count !== null) setTotalProducts(productsRes.count);
      if (recentRes.data) setRecentOrders(recentRes.data as RecentOrder[]);
      if (inventoryRes.data) setLowStock(inventoryRes.data as unknown as LowStockItem[]);
    }
    load();
  }, []);

  const metrics = [
    {
      title: "Total Orders",
      value: totalOrders === null ? "…" : String(totalOrders),
      icon: ShoppingCart,
      alert: false,
    },
    {
      title: "Revenue",
      value: revenue === null ? "…" : `₹${Number(revenue).toLocaleString("en-IN")}`,
      icon: DollarSign,
      alert: false,
    },
    {
      title: "Total Products",
      value: totalProducts === null ? "…" : String(totalProducts),
      icon: Package,
      alert: false,
    },
    {
      title: "Low Stock",
      value: String(lowStock.length),
      icon: AlertTriangle,
      alert: lowStock.length > 0,
    },
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "delivered": return "success";
      case "cancelled": return "destructive";
      case "shipped": return "default";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <Icon className={`h-4 w-4 ${metric.alert ? "text-destructive" : "text-muted-foreground"}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                      No orders yet
                    </TableCell>
                  </TableRow>
                ) : recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium font-mono">{order.order_number}</TableCell>
                    <TableCell>{order.customer_name}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">₹{Number(order.total).toLocaleString("en-IN")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStock.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">All variants are well stocked.</p>
            ) : (
              <div className="space-y-4">
                {lowStock.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-sm">{item.products?.title ?? "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{item.size}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center justify-center rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive">
                        {item.inventory_qty} left
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
