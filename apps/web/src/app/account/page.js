"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { useProduct } from '@/src/context/ProductContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AccountPage() {
  const { currentUser, logout } = useAuth();
  const { productId, priceId, featureId, featureName } = useProduct();
  const router = useRouter();
  
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    // Fetch subscription details
    const fetchSubscriptionDetails = async () => {
      try {
        const response = await fetch(`/api/get-stripe-customer-id/${currentUser.user_ID}`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.stripeCustomerId) {
            const subscriptionResponse = await fetch(`/api/get-subscription-details/${result.stripeCustomerId}`);
            if (subscriptionResponse.ok) {
              const subscriptionData = await subscriptionResponse.json();
              setSubscriptionDetails(subscriptionData.subscription);
              setSubscriptionStatus(subscriptionData.subscription?.status);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching subscription details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionDetails();
  }, [currentUser, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!currentUser) {
    return null; // Will redirect to login
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading account information...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome, {currentUser.firstName || currentUser.email}!
          </h1>
          <p className="text-gray-600">Manage your account and subscriptions</p>
        </div>

        {/* Product Access */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Products</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/melody-bricks">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <h3 className="font-medium text-gray-800 text-xl">Melody Bricks</h3>
                <p className="text-sm text-gray-600">Interval training game</p>
              </div>
            </Link>
            <Link href="/audiation-studio">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <h3 className="font-medium text-gray-800 text-xl">Audiation Studio</h3>
                <p className="text-sm text-gray-600">Advanced ear training</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Account Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Information</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-800">{currentUser.email}</p>
              </div>
              {currentUser.firstName && (
                <div>
                  <label className="text-sm font-medium text-gray-600">First Name</label>
                  <p className="text-gray-800">{currentUser.firstName}</p>
                </div>
              )}
              {currentUser.lastName && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Last Name</label>
                  <p className="text-gray-800">{currentUser.lastName}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-600">User ID</label>
                <p className="text-gray-800 font-mono text-sm">{currentUser.user_ID}</p>
              </div>
            </div>
          </div>

          {/* Subscription Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Subscription Status</h2>
            {subscriptionStatus === 'active' ? (
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-green-700 font-medium">Active Subscription</span>
                </div>
                {subscriptionDetails && (
                  <div className="text-sm text-gray-600">
                    <p>Next billing: {new Date(subscriptionDetails.current_period_end * 1000).toLocaleDateString()}</p>
                    <p>Amount: ${(subscriptionDetails.price?.unit_amount / 100).toFixed(2)} {subscriptionDetails.price?.currency?.toUpperCase()}</p>
                  </div>
                )}
                <Link href="/upgrade">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Manage Subscription
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                  <span className="text-gray-600">No Active Subscription</span>
                </div>
                <p className="text-sm text-gray-600">Upgrade to access premium features</p>
                <Link href="/upgrade">
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                    View Plans
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/upgrade">
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="font-medium text-gray-800">Manage Subscriptions</div>
                  <div className="text-sm text-gray-600">Upgrade, downgrade, or cancel</div>
                </button>
              </Link>
              <Link href="/contact">
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="font-medium text-gray-800">Contact Support</div>
                  <div className="text-sm text-gray-600">Get help with your account</div>
                </button>
              </Link>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Actions</h2>
            <div className="space-y-3">
              <button 
                onClick={handleLogout}
                className="w-full text-left p-3 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
              >
                <div className="font-medium text-red-800">Sign Out</div>
                <div className="text-sm text-red-600">Log out of your account</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
