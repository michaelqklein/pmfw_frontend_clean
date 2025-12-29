// Refactored StripeSubscription component
// Major improvements:
// 1. Added support for sending correct promotion_code.id to backend.
// 2. Improved clarity with naming and function extraction.
// 3. Added comments and guard clauses to minimize logic nesting.

'use client';

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import '@/src/styles/StripeSubscription.css';
import { updateStripeCustomerId, upsertUserAccess } from '@/src/interfaces/apiSQLfrontend';
import { useProduct } from '@/src/context/ProductContext';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({
    setCurrentPaymentId,
    priceId,
    selectedPrice,
    stripeCustomerId,
    userId,
    userEmail,
    setCurrentAccessType,
    setSubscriptionStatus,
    setSubscriptionId,
    setChangeSubscriptionAttempt,
}) => {
    const [email, setEmail] = useState('');
    const [coupon, setCoupon] = useState('');
    const [showCouponField, setShowCouponField] = useState(false);
    const [verifiedCoupon, setVerifiedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingMessage, setProcessingMessage] = useState('');
    const [submissionId, setSubmissionId] = useState(null);

    const stripe = useStripe();
    const elements = useElements();
    const { featureId, featureName } = useProduct();

    const toggleCouponField = () => {
        setShowCouponField(!showCouponField);
        setCoupon('');
        setVerifiedCoupon(null);
        setCouponError('');
    };

    const handleVerifyCoupon = async () => {
        setCouponError('');
        setVerifiedCoupon(null);

        try {
            const res = await fetch('/api/validate-coupon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: coupon }),
            });

            const data = await res.json();
            if (data.valid) {
                setVerifiedCoupon(data);
            } else {
                setCouponError('Invalid or expired coupon.');
            }
        } catch {
            setCouponError('Error validating coupon.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const currentSubmissionId = Date.now().toString();
        if (isProcessing || submissionId) return;

        setSubmissionId(currentSubmissionId);
        setIsProcessing(true);
        setProcessingMessage('Processing payment...');
        setErrorMessage(null);

        if (!stripe || !elements) {
            setIsProcessing(false);
            setSubmissionId(null);
            return;
        }

        try {
            const cardElement = elements.getElement(CardElement);
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            });

            if (error) throw new Error(error.message);

            setProcessingMessage('Creating subscription...');
            const response = await fetch('/api/create-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    payment_method: paymentMethod.id,
                    price_id: priceId,
                    stripeCustomerId,
                    promotion_code: verifiedCoupon?.promotion_code || null,
                    idempotencyKey: currentSubmissionId,
                }),
            });

            const subscription = await response.json();
            if (subscription.error) throw new Error(subscription.error);

            setSubscriptionId(subscription.subscriptionId);
            setCurrentPaymentId(priceId);

            if (subscription.clientSecret) {
                const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
                    subscription.clientSecret,
                    { payment_method: paymentMethod.id }
                );

                if (confirmError || paymentIntent.status !== 'succeeded') {
                    throw new Error(confirmError?.message || 'Payment could not be completed.');
                }
            }

            setProcessingMessage('Updating account...');
            await updateStripeCustomerId(userId, subscription.stripeCustomerId);
            await upsertUserAccess(userId, userEmail, featureId, featureName, true, 'stripe_subscription');

            setCurrentAccessType('stripe_subscription');
            setSubscriptionStatus('active');
            setChangeSubscriptionAttempt(false);
            alert('Subscription successful.');

        } catch (err) {
            console.error(err);
            setErrorMessage(err.message || 'An error occurred during subscription.');
        } finally {
            setIsProcessing(false);
            setProcessingMessage('');
        }
    };

    const formatCurrency = (amount, currency) => `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`;
    const discountedAmount = () => {
        const base = selectedPrice.unit_amount;
        if (verifiedCoupon?.percent_off) return base * (1 - verifiedCoupon.percent_off / 100);
        if (verifiedCoupon?.amount_off) return base - verifiedCoupon.amount_off;
        return base;
    };

    return (
        <form onSubmit={handleSubmit} className="payment-form">
            {isProcessing && <div className="processing-message">{processingMessage}</div>}

            <div className="selected-plan">
                {verifiedCoupon ? (
                    <>
                        <div>Original: {formatCurrency(selectedPrice.unit_amount, selectedPrice.currency)}</div>
                        <div className="text-green-700">Discounted: {formatCurrency(discountedAmount(), selectedPrice.currency)}</div>
                    </>
                ) : (
                    <>Selected Plan: {formatCurrency(selectedPrice.unit_amount, selectedPrice.currency)}</>
                )}
            </div>

            <button type="button" onClick={toggleCouponField} className="text-blue-600 hover:text-blue-800 text-sm mb-2">
                {showCouponField ? 'Remove Discount Code' : 'Have a Discount Code?'}
            </button>

            {showCouponField && (
                <div className="mb-2">
                    <label>Discount Code</label>
                    <div className="flex gap-2 items-center">
                        <input
                            type="text"
                            placeholder="Enter coupon code"
                            value={coupon}
                            onChange={(e) => setCoupon(e.target.value)}
                            className="border px-2 py-1 rounded w-full"
                        />
                        <button
                            type="button"
                            onClick={handleVerifyCoupon}
                            className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded"
                        >
                            Verify
                        </button>
                    </div>
                    {verifiedCoupon && (
                        <div className="text-green-600 text-sm">Coupon applied: {verifiedCoupon.percent_off
                            ? `${verifiedCoupon.percent_off}% off`
                            : `$${(verifiedCoupon.amount_off / 100).toFixed(2)} off`}</div>
                    )}
                    {couponError && <div className="text-red-600 text-sm">{couponError}</div>}
                </div>
            )}

            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

            <label>Card Information</label>
            <CardElement className="StripeElement" />

            <button className="subscribe-button" type="submit" disabled={!stripe || isProcessing}>
                {isProcessing ? 'Processing...' : 'Subscribe'}
            </button>

            {errorMessage && <div className="error-message">{errorMessage}</div>}
        </form>
    );
};

const StripeSubscription = (props) => (
    <div className="stripe-subscription-container">
        <Elements stripe={stripePromise}>
            <CheckoutForm {...props} />
        </Elements>
    </div>
);

export default StripeSubscription;
