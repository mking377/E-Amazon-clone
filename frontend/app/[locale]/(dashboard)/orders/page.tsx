// frontend/app/[locale]/(dashboard)/orders/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import api from "../../../../lib/axios";
import { Loading } from "../../../../components/ui/Loading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/Card";
import ProtectedRoute from "../../../../components/common/ProtectedRoute";

const OrdersPage = () => {
  const t = useTranslations("navigation");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Assume there's an orders endpoint
        const response = await api.get("/orders");
        setOrders(response.data.orders || []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <Loading />;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>{t("orders")}</CardTitle>
              <CardDescription>Your order history</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p>No orders found</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded p-4">
                      <p>Order ID: {order.id}</p>
                      <p>Status: {order.status}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default OrdersPage;
