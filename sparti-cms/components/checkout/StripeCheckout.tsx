/**
 * Shared Stripe Checkout Component
 * Reusable Stripe payment form component for all themes
 */

import React, { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2, AlertCircle } from 'lucide-react';
import { initializeStripe } from '../../services/stripeCheckout';

interface StripeCheckoutProps {
  clientSecret: string;
  publishableKey: string;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: Error) => void;
  className?: string;
}

const CheckoutForm: React.FC<{
  clientSecret: string;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: Error) => void;
}> = ({ clientSecret, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe is not loaded. Please wait...');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // First, submit the elements to validate the form
      const { error: submitError } = await elements.submit();
      
      if (submitError) {
        setError(submitError.message || 'Please check your payment details');
        setIsProcessing(false);
        return;
      }

      // If validation passes, confirm the payment
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
        redirect: 'if_required',
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        onError(new Error(stripeError.message || 'Payment failed'));
      } else if (paymentIntent) {
        if (paymentIntent.status === 'succeeded') {
          onSuccess(paymentIntent);
        } else if (paymentIntent.status === 'requires_action') {
          // Payment requires additional action (3D Secure, etc.)
          // Stripe will handle the redirect automatically
        } else {
          setError(`Payment status: ${paymentIntent.status}`);
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      onError(new Error(errorMessage));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || !elements || isProcessing}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          'Pay Now'
        )}
      </button>
    </form>
  );
};

export const StripeCheckout: React.FC<StripeCheckoutProps> = ({
  clientSecret,
  publishableKey,
  onSuccess,
  onError,
  className = '',
}) => {
  const [stripe, setStripe] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const stripeInstance = await initializeStripe(publishableKey);
        setStripe(stripeInstance);
      } catch (err: any) {
        console.error('[testing] Error initializing Stripe:', err);
        onError(new Error('Failed to initialize payment system'));
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [publishableKey, onError]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-2 text-muted-foreground">Loading payment form...</span>
      </div>
    );
  }

  if (!stripe || !clientSecret) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
        <AlertCircle className="h-5 w-5 inline mr-2" />
        Failed to initialize payment system. Please try again.
      </div>
    );
  }

  return (
    <div className={className}>
      <Elements stripe={stripe} options={{ clientSecret }}>
        <CheckoutForm
          clientSecret={clientSecret}
          onSuccess={onSuccess}
          onError={onError}
        />
      </Elements>
    </div>
  );
};
