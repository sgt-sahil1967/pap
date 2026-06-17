import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/hooks/use-cart";
import { SiteConfigProvider } from "@/context/SiteConfigContext";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import Collections from "@/pages/Collections";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import About from "@/pages/About";
import Checkout from "@/pages/Checkout";
import PaymentStatus from "@/pages/PaymentStatus";

import AdminLogin from "@/pages/admin/AdminLogin";
import AdminGuard from "@/pages/admin/AdminGuard";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminHomepage from "@/pages/admin/AdminHomepage";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminOrders from "@/pages/admin/AdminOrders";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/collections" component={Collections} />
      <Route path="/collections/:type" component={Collections} />
      <Route path="/products/:handle" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/about" component={About} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/payment/status" component={PaymentStatus} />

      <Route path="/admin">
        {() => <AdminLogin />}
      </Route>
      <Route path="/admin/dashboard">
        {() => (
          <AdminGuard>
            <AdminDashboard />
          </AdminGuard>
        )}
      </Route>
      <Route path="/admin/homepage">
        {() => (
          <AdminGuard>
            <AdminHomepage />
          </AdminGuard>
        )}
      </Route>
      <Route path="/admin/products">
        {() => (
          <AdminGuard>
            <AdminProducts />
          </AdminGuard>
        )}
      </Route>
      <Route path="/admin/orders">
        {() => (
          <AdminGuard>
            <AdminOrders />
          </AdminGuard>
        )}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SiteConfigProvider>
        <CartProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </CartProvider>
      </SiteConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
