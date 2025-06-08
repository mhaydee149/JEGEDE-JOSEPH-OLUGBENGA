import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function OrderTracking() {
  const [orderNumber, setOrderNumber] = useState("");
  const [searchAttempted, setSearchAttempted] = useState(false);

  const trackingData = useQuery(
    api.tracking.getTrackingByOrderNumber,
    orderNumber && searchAttempted ? { orderNumber } : "skip"
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderNumber.trim()) {
      setSearchAttempted(true);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return "💳";
      case "processing":
        return "⚙️";
      case "shipped":
        return "🚚";
      case "delivered":
        return "📦";
      default:
        return "📋";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Track Your Order</h2>

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            placeholder="Enter order number (last 8 digits)"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            maxLength={8}
          />
          <button
            type="submit"
            className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-hover transition-colors"
          >
            Track Order
          </button>
        </form>
      </div>

      {searchAttempted && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {trackingData === undefined ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : trackingData === null ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Order not found. Please check your order number.</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Order #{trackingData.order._id.slice(-8)}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Order Details</h4>
                    <p className="text-sm text-gray-600">Date: {new Date(trackingData.order._creationTime).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">Total: ${trackingData.order.total.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">
                      Status: <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trackingData.order.status)}`}>
                        {trackingData.order.status.charAt(0).toUpperCase() + trackingData.order.status.slice(1)}
                      </span>
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
                    <p className="text-sm text-gray-600">
                      {trackingData.order.shippingAddress.street}<br />
                      {trackingData.order.shippingAddress.city}, {trackingData.order.shippingAddress.state} {trackingData.order.shippingAddress.zipCode}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="font-medium text-gray-900 mb-4">Items Ordered</h4>
                <div className="space-y-2">
                  {trackingData.order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.productName} × {item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-4">Tracking History</h4>
                {trackingData.trackingEvents.length === 0 ? (
                  <p className="text-gray-500 text-sm">No tracking events yet.</p>
                ) : (
                  <div className="space-y-4">
                    {trackingData.trackingEvents.map((event) => (
                      <div key={event._id} className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm">
                          {getStatusIcon(event.status)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(event._creationTime).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900">{event.description}</p>
                          {event.location && (
                            <p className="text-sm text-gray-600">📍 {event.location}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
