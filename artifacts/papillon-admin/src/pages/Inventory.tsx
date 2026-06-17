import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function Inventory() {
  const [search, setSearch] = useState("");
  const [inventory, setInventory] = useState([
    { id: "1", product: "Blue Denim Kurta", size: "S", sku: "BDK-S-01", stock: 12, reserved: 2 },
    { id: "2", product: "Blue Denim Kurta", size: "M", sku: "BDK-M-01", stock: 4, reserved: 0 },
    { id: "3", product: "Blue Denim Kurta", size: "L", sku: "BDK-L-01", stock: 1, reserved: 0 },
    { id: "4", product: "Silk Saree", size: "One Size", sku: "SS-OS-01", stock: 15, reserved: 5 },
  ]);

  const handleStockChange = (id: string, newStock: string) => {
    setInventory(inventory.map(item => 
      item.id === id ? { ...item, stock: parseInt(newStock) || 0 } : item
    ));
  };

  const getRowColor = (available: number) => {
    if (available < 2) return "bg-destructive/10";
    if (available < 5) return "bg-warning/10";
    return "";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
      </div>

      <Card>
        <CardHeader className="py-4">
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by SKU or product..."
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
                <TableHead>Product</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="w-32">Stock Qty</TableHead>
                <TableHead className="text-center">Reserved</TableHead>
                <TableHead className="text-right">Available</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => {
                const available = item.stock - item.reserved;
                return (
                  <TableRow key={item.id} className={getRowColor(available)}>
                    <TableCell className="font-medium">{item.product}</TableCell>
                    <TableCell>{item.size}</TableCell>
                    <TableCell className="font-mono text-xs">{item.sku}</TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        className="h-8 w-20"
                        value={item.stock}
                        onChange={(e) => handleStockChange(item.id, e.target.value)}
                      />
                    </TableCell>
                    <TableCell className="text-center">{item.reserved}</TableCell>
                    <TableCell className={`text-right font-bold ${available < 5 ? "text-destructive" : ""}`}>
                      {available}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
