import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useState } from "react";
import { ProductList } from "./components/ProductList";
import { Cart } from "./components/Cart";
import { OrderHistory } from "./components/OrderHistory";
import { Checkout } from "./components/Checkout";
import { AdminPanel } from "./components/AdminPanel";
import { OrderTracking } from "./components/OrderTracking";

export default function App() {
  const [currentView, setCurrentView] = useState<"products" | "cart" | "orders" | "checkout" | "admin" | "tracking">("products");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <h1 
              className="text-2xl font-bold text-primary cursor-pointer"
              onClick={() => setCurrentView("products")}
            >
              ShopHub
            </h1>
            <Authenticated>
              <nav className="flex gap-6">
                <button
                  onClick={() => setCurrentView("products")}
                  className={`font-medium transition-colors ${
                    currentView === "products" ? "text-primary" : "text-gray-600 hover:text-primary"
                  }`}
                >
                  Products
                </button>
                <button
                  onClick={() => setCurrentView("cart")}
                  className={`font-medium transition-colors ${
                    currentView === "cart" ? "text-primary" : "text-gray-600 hover:text-primary"
                  }`}
                >
                  Cart
                </button>
                <button
                  onClick={() => setCurrentView("orders")}
                  className={`font-medium transition-colors ${
                    currentView === "orders" ? "text-primary" : "text-gray-600 hover:text-primary"
                  }`}
                >
                  Orders
                </button>
                <button
                  onClick={() => setCurrentView("tracking")}
                  className={`font-medium transition-colors ${
                    currentView === "tracking" ? "text-primary" : "text-gray-600 hover:text-primary"
                  }`}
                >
                  Track Order
                </button>
                <AdminButton currentView={currentView} setCurrentView={setCurrentView} />
              </nav>
            </Authenticated>
          </div>
          <SignOutButton />
        </div>
      </header>

      <main className="flex-1">
        <Content 
          currentView={currentView} 
          setCurrentView={setCurrentView}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      </main>
      <Toaster />
    </div>
  );
}

function AdminButton({ 
  currentView, 
  setCurrentView 
}: {
  currentView: string;
  setCurrentView: (view: "products" | "cart" | "orders" | "checkout" | "admin" | "tracking") => void;
}) {
  const user = useQuery(api.auth.loggedInUser);
  
  if (!(user as any)?.isAdmin) {
    return null;
  }

  return (
    <button
      onClick={() => setCurrentView("admin")}
      className={`font-medium transition-colors ${
        currentView === "admin" ? "text-primary" : "text-gray-600 hover:text-primary"
      }`}
    >
      Admin
    </button>
  );
}

function Content({ 
  currentView, 
  setCurrentView, 
  selectedCategory, 
  setSelectedCategory 
}: {
  currentView: "products" | "cart" | "orders" | "checkout" | "admin" | "tracking";
  setCurrentView: (view: "products" | "cart" | "orders" | "checkout" | "admin" | "tracking") => void;
  selectedCategory: string | undefined;
  setSelectedCategory: (category: string | undefined) => void;
}) {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Unauthenticated>
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-primary mb-4">Welcome to ShopHub</h2>
            <p className="text-gray-600">Sign in to start shopping</p>
          </div>
          <SignInForm />
        </div>
      </Unauthenticated>

      <Authenticated>
        {currentView === "products" && (
          <ProductList 
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        )}
        {currentView === "cart" && <Cart setCurrentView={setCurrentView} />}
        {currentView === "orders" && <OrderHistory />}
        {currentView === "checkout" && <Checkout setCurrentView={setCurrentView} />}
        {currentView === "tracking" && <OrderTracking />}
        {currentView === "admin" && (loggedInUser as any)?.isAdmin && <AdminPanel />}
      </Authenticated>
    </div>
  );
}
