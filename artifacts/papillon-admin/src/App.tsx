import { Switch, Route, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/lib/auth";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import ProductForm from "@/pages/ProductForm";
import Orders from "@/pages/Orders";
import OrderDetail from "@/pages/OrderDetail";
import Inventory from "@/pages/Inventory";
import Customers from "@/pages/Customers";
import HomepageSettings from "@/pages/HomepageSettings";

const queryClient = new QueryClient();

// A wrapper for protected routes
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }
  
  return (
    <Layout>
      <Component />
    </Layout>
  );
}

function Router() {
  const { isAuthenticated } = useAuth();
  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      {/* Protected Routes */}
      <Route path="/">
        {isAuthenticated ? <Redirect to="/dashboard" /> : <Redirect to="/login" />}
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>

      <Route path="/products">
        <ProtectedRoute component={Products} />
      </Route>
      <Route path="/products/new">
        <ProtectedRoute component={ProductForm} />
      </Route>
      <Route path="/products/:id/edit">
        <ProtectedRoute component={ProductForm} />
      </Route>

      <Route path="/orders">
        <ProtectedRoute component={Orders} />
      </Route>
      <Route path="/orders/:id">
        <ProtectedRoute component={OrderDetail} />
      </Route>

      <Route path="/inventory">
        <ProtectedRoute component={Inventory} />
      </Route>

      <Route path="/customers">
        <ProtectedRoute component={Customers} />
      </Route>

      <Route path="/homepage">
        <ProtectedRoute component={HomepageSettings} />
      </Route>
      
      <Route>
        <Layout>
          <div className="p-8 text-center">
            <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
          </div>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  // Use basePath for wouter
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
