import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Customer = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
};

export default function Customers() {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const searchRef = useRef<ReturnType<typeof setTimeout>>();

  const load = async () => {
    setLoading(true);
    let query = supabase
      .from("customers")
      .select("id, name, email, phone, created_at")
      .order("created_at", { ascending: false });
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    const { data } = await query;
    setCustomers((data ?? []) as Customer[]);
    setLoading(false);
  };

  useEffect(() => {
    clearTimeout(searchRef.current);
    searchRef.current = setTimeout(load, 300);
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
      </div>

      <Card>
        <CardHeader className="py-4">
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
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
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No customers yet
                    </TableCell>
                  </TableRow>
                ) : customers.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.phone ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      {new Date(customer.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
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
