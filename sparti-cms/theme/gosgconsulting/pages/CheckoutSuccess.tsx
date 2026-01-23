import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const CheckoutSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, paymentIntentId } = location.state || {};

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <CheckCircle className="h-16 w-16 mx-auto text-green-600 mb-4" />
        <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-muted-foreground mb-6">
          Your order has been confirmed and payment processed.
        </p>
        {orderId && (
          <p className="text-sm text-muted-foreground mb-4">
            Order ID: {orderId}
          </p>
        )}
        {paymentIntentId && (
          <p className="text-sm text-muted-foreground mb-4">
            Payment ID: {paymentIntentId}
          </p>
        )}
        <button
          onClick={() => navigate('/theme/gosgconsulting')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
