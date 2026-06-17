import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { useToast } from "@/hooks/use-toast";
import {
  ShoppingBag, Search, ChevronLeft, ChevronRight,
  X, Package, MapPin, CreditCard, Clock, RefreshCw
} from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const FULFILLMENT_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

const FULFILLMENT_COLORS: Record<string, string> = {
  pending:    "bg-yellow-100 text-yellow-700",
  confirmed:  "bg-blue-100 text-blue-700",
  processing: "bg-indigo-100 text-indigo-700",
  shipped:    "bg-purple-100 text-purple-700",
  delivered:  "bg-green-100 text-green-700",
  cancelled:  "bg-red-100 text-red-700",
  returned:   "bg-gray-100 text-gray-700",
};

const PAYMENT_COLORS: Record<string, string> = {
  pending:  "bg-yellow-100 text-yellow-700",
  paid:     "bg-green-100 text-green-700",
  failed:   "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-700",
};

type OrderItem = {
  productId: string; variantId: number; title: string;
  size: string; price: number; quantity: number; image: string;
};

type ShippingAddress = {
  line1: string; line2?: string; city: string;
  state: string; pincode: string; country: string;
};

type Order = {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  paymentStatus: string;
  notes: string | null;
  createdAt: string | number;
};

function token() {
  return sessionStorage.getItem("papillon_admin_token") ?? "";
}

function fmt(amount: number) {
  return `₹${Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

function fmtDate(val: string | number) {
  const d = typeof val === "number" ? new Date(val * 1000) : new Date(val);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AdminOrders() {
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPayment, setFilterPayment] = useState("");

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [notes, setNotes] = useState("");

  const LIMIT = 20;

  async function fetchOrders(p = 1) {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(LIMIT) });
      if (search) params.set("search", search);
      if (filterStatus) params.set("status", filterStatus);
      if (filterPayment) params.set("paymentStatus", filterPayment);

      const res = await fetch(`${BASE}/api/orders?${params}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      setOrders(data.orders ?? []);
      setHasMore((data.orders?.length ?? 0) === LIMIT);
    } catch {
      toast({ title: "Failed to load orders", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function fetchOrderDetail(id: number) {
    setDetailLoading(true);
    try {
      const res = await fetch(`${BASE}/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      setSelectedOrder(data);
      setNewStatus(data.status);
      setNotes(data.notes ?? "");
    } catch {
      toast({ title: "Failed to load order details", variant: "destructive" });
    } finally {
      setDetailLoading(false);
    }
  }

  async function updateStatus() {
    if (!selectedOrder) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`${BASE}/api/orders/${selectedOrder.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ status: newStatus, notes }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Order updated successfully" });
      fetchOrderDetail(selectedOrder.id);
      fetchOrders(page);
    } catch {
      toast({ title: "Failed to update order", variant: "destructive" });
    } finally {
      setUpdatingStatus(false);
    }
  }

  useEffect(() => { fetchOrders(1); setPage(1); }, [search, filterStatus, filterPayment]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
  }

  const totalItems = orders.reduce((s, o) => s + (o.items?.length ?? 0), 0);

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {orders.length} order{orders.length !== 1 ? "s" : ""} · {totalItems} item{totalItems !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => fetchOrders(page)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <form onSubmit={handleSearch} className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search by order # or email…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            {searchInput && (
              <button type="button" onClick={() => { setSearchInput(""); setSearch(""); }} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}
          </form>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
          >
            <option value="">All Fulfillment</option>
            {FULFILLMENT_STATUSES.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>

          <select
            value={filterPayment}
            onChange={e => setFilterPayment(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
          >
            <option value="">All Payments</option>
            {PAYMENT_STATUSES.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <ShoppingBag className="w-12 h-12 mb-3 opacity-30" />
              <p className="font-medium">No orders found</p>
              <p className="text-sm mt-1">Orders will appear here once customers start placing them.</p>
            </div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Order</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Items</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Payment</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fulfillment</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map(order => (
                    <tr
                      key={order.id}
                      onClick={() => fetchOrderDetail(order.id)}
                      className="hover:bg-purple-50/50 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3.5 font-mono font-medium text-purple-700">{order.orderNumber}</td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-gray-800">{order.customerName}</div>
                        <div className="text-gray-400 text-xs">{order.customerEmail}</div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">{order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? "s" : ""}</td>
                      <td className="px-5 py-3.5 font-semibold text-gray-900">{fmt(order.total)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PAYMENT_COLORS[order.paymentStatus] ?? "bg-gray-100 text-gray-600"}`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${FULFILLMENT_COLORS[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs">{fmtDate(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                <span className="text-xs text-gray-400">Page {page}</span>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => { const p = page - 1; setPage(p); fetchOrders(p); }}
                    className="p-1.5 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={!hasMore}
                    onClick={() => { const p = page + 1; setPage(p); fetchOrders(p); }}
                    className="p-1.5 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Order Detail Drawer */}
      {(selectedOrder || detailLoading) && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="w-full max-w-xl bg-white h-full flex flex-col shadow-2xl overflow-auto">
            {detailLoading ? (
              <div className="flex items-center justify-center flex-1">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : selectedOrder ? (
              <>
                {/* Drawer Header */}
                <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 font-mono">{selectedOrder.orderNumber}</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{fmtDate(selectedOrder.createdAt)}</p>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="p-1.5 rounded-lg hover:bg-gray-100">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="flex-1 px-6 py-5 space-y-6 overflow-auto">
                  {/* Status Badges */}
                  <div className="flex gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${PAYMENT_COLORS[selectedOrder.paymentStatus] ?? "bg-gray-100 text-gray-600"}`}>
                      <CreditCard className="w-3 h-3" /> Payment: {selectedOrder.paymentStatus}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${FULFILLMENT_COLORS[selectedOrder.status] ?? "bg-gray-100 text-gray-600"}`}>
                      <Package className="w-3 h-3" /> {selectedOrder.status}
                    </span>
                  </div>

                  {/* Customer */}
                  <section>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Customer</h3>
                    <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                      <p className="font-medium text-gray-800">{selectedOrder.customerName}</p>
                      <p className="text-sm text-gray-600">{selectedOrder.customerEmail}</p>
                      <p className="text-sm text-gray-600">{selectedOrder.customerPhone}</p>
                    </div>
                  </section>

                  {/* Shipping Address */}
                  <section>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Shipping Address
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 leading-relaxed">
                      {selectedOrder.shippingAddress.line1}<br />
                      {selectedOrder.shippingAddress.line2 && <>{selectedOrder.shippingAddress.line2}<br /></>}
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} – {selectedOrder.shippingAddress.pincode}<br />
                      {selectedOrder.shippingAddress.country}
                    </div>
                  </section>

                  {/* Items */}
                  <section>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Items</h3>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                          {item.image ? (
                            <img src={item.image} alt={item.title} className="w-12 h-12 object-cover rounded-md border border-gray-200 shrink-0" />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-md shrink-0 flex items-center justify-center">
                              <Package className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 text-sm truncate">{item.title}</p>
                            <p className="text-xs text-gray-500">{item.size} · qty {item.quantity}</p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900 shrink-0">{fmt(item.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Totals */}
                  <section>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Summary</h3>
                    <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span><span>{fmt(selectedOrder.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Shipping</span><span>{Number(selectedOrder.shipping) === 0 ? "Free" : fmt(selectedOrder.shipping)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-200 pt-1.5 mt-1.5">
                        <span>Total</span><span>{fmt(selectedOrder.total)}</span>
                      </div>
                    </div>
                  </section>

                  {/* Update Fulfillment Status */}
                  <section>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Update Fulfillment Status
                    </h3>
                    <div className="space-y-3">
                      <select
                        value={newStatus}
                        onChange={e => setNewStatus(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                      >
                        {FULFILLMENT_STATUSES.map(s => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                      <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Internal notes (optional)…"
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                      />
                      <button
                        onClick={updateStatus}
                        disabled={updatingStatus || newStatus === selectedOrder.status}
                        className="w-full py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {updatingStatus ? "Saving…" : "Save Status"}
                      </button>
                    </div>
                  </section>

                  {selectedOrder.notes && (
                    <section>
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Notes</h3>
                      <p className="text-sm text-gray-700 bg-yellow-50 border border-yellow-100 rounded-lg p-3">{selectedOrder.notes}</p>
                    </section>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
