import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Orders() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [, setLocation] = useLocation();

  const mockOrders = [
    { id: "ORD-1001", customer: "Alice Cooper", email: "alice@example.com", date: "2023-10-25 14:30", total: "₹4,200", status: "pending", payment: "paid" },
    { id: "ORD-1002", customer: "Bob Builder", email: "bob@example.com", date: "2023-10-25 10:15", total: "₹1,850", status: "processing", payment: "paid" },
    { id: "ORD-1003", customer: "Charlie Day", email: "charlie@example.com", date: "2023-10-24 16:45", total: "₹2,100", status: "shipped", payment: "paid" },
    { id: "ORD-1004", customer: "Diana Prince", email: "diana@example.com", date: "2023-10-23 09:20", total: "₹800", status: "delivered", payment: "paid" },
    { id: "ORD-1005", customer: "Evan Wright", email: "evan@example.com", date: "2023-10-22 11:10", total: "₹5,500", status: "cancelled", payment: "refunded" },
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case "delivered": return "success";
      case "cancelled": return "destructive";
      case "shipped": return "default";
      case "processing": return "warning";
      default: return "secondary";
    }
  };

  const tabs = ["all", "pending", "processing", "shipped", "delivered", "cancelled"];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Orders</h2>

      <Card>
        <div className="border-b px-4 flex gap-4 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`py-3 px-1 border-b-2 text-sm font-medium whitespace-nowrap ${filter === tab ? "border-[#930497] text-[#930497]" : "border-transparent text-muted-foreground hover:text-foreground"}`}
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
              {mockOrders.map((order) => (
                <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setLocation(`/orders/${order.id}`)}>
                  <TableCell className="font-medium font-mono">{order.id}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>
                    <div>{order.customer}</div>
                    <div className="text-xs text-muted-foreground">{order.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={order.payment === "paid" ? "success" : "secondary"}>
                      {order.payment}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{order.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
