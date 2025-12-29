'use client';
import React, { useState, useEffect } from 'react';
import Tier from './Tier';
import StripeSubscription from './StripeSubscription';
import { checkAccess } from '@/src/utils/checkAccess';
import {
    checkFreeTrial,
    addFreeTrial,
    upsertUserAccess,
    validateBetaCode
} from '@/src/interfaces/apiSQLfrontend';
import '@/src/styles/Upgrade.css';
import { useAuth } from '@/src/context/AuthContext'; // ✅ Import the context
import { useProduct } from "@/src/context/ProductContext";

const Upgrade = () => {

    const { currentUser } = useAuth(); // ✅ Access context
    const { productId } = useProduct();
    // console.log("productId: ", productId);
    // console.log("currentUser: ", currentUser);
    const { priceId } = useProduct();
    // console.log("priceId: ", priceId);
    const { featureId } = useProduct();
    const { featureName } = useProduct();
    const { freeTrialAvailable } = useProduct();
    // console.log("freeTrialAvailable: ", freeTrialAvailable);
    const { betaTesting } = useProduct();
    const userId = currentUser?.user_ID;
    const userEmail = currentUser?.email;
    const [explanation, setExplanation] = useState('');
    const [changeSubscriptionAttempt, setChangeSubscriptionAttempt] = useState(false);
    const [firstTime, setFirstTime] = useState(true);
    const [freeTrialExpired, setFreeTrialExpired] = useState(false);
    const [betaCodeValid, setBetaCodeValid] = useState(false);
    const [currentAccessType, setCurrentAccessType] = useState(null);
    const [selectedTier, setSelectedTier] = useState(null);
    const [currentPaymentId, setCurrentPaymentId] = useState(null);
    const [selectedPrice, setSelectedPrice] = useState(null);
    const [products, setProducts] = useState([]);
    const [subscriptionId, setSubscriptionId] = useState(null);
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [betaCode, setBetaCode] = useState('');
    const [isCodeValid, setIsCodeValid] = useState(false);
    const [stripeCustomerId, setStripeCustomerId] = useState(null); // Store stripe_customer_id
    const [pointerToBetaTester, setPointerToBetaTester] = useState(false);
    const [pointerToFreeTrial, setPointerToFreeTrial] = useState(false); // Track free trial tier selection
    const [pointerToSubscription, setPointerToSubscribed] = useState(false);
    const [subscriptionWillEndAtPeriodEnd, setSubscriptionWillEndAtPeriodEnd] = useState(null);
    const [billingPeriodEndDate, setBillingPeriodEndDate] = useState(null);
    const [nextSubscriptionId, setNextSubscriptionId] = useState(null);
    const [nextSubscriptionStartDate, setNextSubscriptionStartDate] = useState(null);

    useEffect(() => {
        console.log('firstTime updated: ', firstTime);
    }, [firstTime]);

    useEffect(() => {

        console.log('main use effect function');
        // Fetch current access_type
        const fetchAccessType = async () => {

            // check free trial database.
            if (freeTrialAvailable) {
                console.log("Free trial available.");
                const freeTrialCheckResults = await checkFreeTrial(userId, featureId, featureName);
                console.log("any free trial data found? ", freeTrialCheckResults.data);
                setFirstTime(!(freeTrialCheckResults.data));
                // setFreeTrialExpired to true if there is any data
                // it can be set back to false if you are still on a free trial
                setFreeTrialExpired(freeTrialCheckResults.data);
                console.log('first Time: ', firstTime);
            }

            const results = await checkAccess(userId, featureId, featureName);

            const accessType = await results.access_type;
            const fTime = !results.data;
            console.log('fTime: ', fTime);

            console.log('Access Type:', accessType);
            console.log('results.data: ', results.data);
            console.log('first Time: ', firstTime);

            switch (accessType) {
                case 'free_trial':
                    if (results.freeTrialExpired) {
                        console.log("free trial started more than 2 days ago.");
                        setFreeTrialExpired(true);
                        setPointerToFreeTrial(false);
                        setPointerToBetaTester(false);
                        setPointerToSubscribed(false);
                    }
                    else {
                        console.log("Setting pointer to free_trial");
                        setFreeTrialExpired(false);
                        setPointerToFreeTrial(true);
                        setPointerToBetaTester(false);
                        setPointerToSubscribed(false);
                        setCurrentAccessType(accessType);  // Set the access type once the promise is resolved               
                    }
                    break;
                case 'stripe_subscription':
                    setFreeTrialExpired(true);
                    console.log("Setting pointer to stripe_subscription");
                    setPointerToSubscribed(true);
                    setPointerToFreeTrial(false);
                    setPointerToBetaTester(false);
                    setCurrentAccessType(accessType);  // Set the access type once the promise is resolved
                    break;
                case 'beta_tester':
                    setFreeTrialExpired(true);
                    console.log("Setting pointer to beta_tester");
                    console.log("validating beta code: ", results.beta_code);
                    if (results.betaCodeExpired) {
                        setExplanation(results.message);
                        console.log("beta code invalid");
                        setBetaCodeValid(false);
                        setCurrentAccessType(null);  // Set the access type once the promise is resolved
                    }
                    else {
                        console.log("beta code valid");
                        setBetaCodeValid(true);
                        console.log("accessType: ", accessType);
                        setCurrentAccessType(accessType);  // Set the access type once the promise is resolved
                        console.log("currentAccessType: ", currentAccessType);
                        console.log("- free_trial: ", (currentAccessType == 'free_trial'));
                    }
                    setPointerToBetaTester(true);
                    setPointerToFreeTrial(false);
                    setPointerToSubscribed(false);
                    // console.log("- beta pointer: ", pointerToBetaTester);
                    // console.log("- free_trial: ", (currentAccessType == 'free_trial')); 
                    // console.log("- first time: ", firstTime); 
                    // console.log("- beta code valid: ", (!betaCodeValid));
                    break;
                default:
                    console.log("Default case: No access type found.");
                    if (firstTime && freeTrialAvailable) {
                        console.log("Default case: Setting pointer to free_trial");
                        setPointerToFreeTrial(true);
                        setPointerToSubscribed(false);
                    }
                    else {
                        console.log("Default case: Setting pointer to subscribed");
                        setPointerToFreeTrial(false);
                        setPointerToSubscribed(true);
                        // console.log("Setting selected tier to: ", priceId);
                        // setSelectedTier(priceId);
                    }
                    setPointerToBetaTester(false);
                    break;
            }
        };

        // Fetch details of a specific product
        const fetchSpecificProduct = async (productId) => {
            const response = await fetch(`/api/get-specific-product/${productId}`);
            const data = await response.json();
            setProducts([data]); // wrap in array if you expect the state to stay as an array

            // Optional: update selected tier/price
            // setSelectedTier(data.prices[0].id);
            // setSelectedPrice(data.prices[0]);
        };

        // Fetch products and subscription info
        const fetchProducts = async () => {
            const response = await fetch(`/api/products`);
            const data = await response.json();
            
            // Filter out archived products (products with active: false or missing active property)
            const activeProducts = data.filter(product => product.active !== false);
            
            setProducts(activeProducts);

            if (activeProducts.length > 0) {
                // setSelectedTier(activeProducts[0].prices[0].id);
                // setSelectedPrice(activeProducts[0].prices[0]);
            }
        };

        // Fetch the stripe_customer_id from the backend

        const fetchStripeCustomerId = async () => {
            console.log
            try {
                const response = await fetch(`/api/get-stripe-customer-id/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                // Check if the response is OK (status code 200-299)
                if (!response.ok) {
                    throw new Error('Failed to fetch, status: ' + response.status);
                }

                const result = await response.json();

                // Log the response for debugging
                console.log('Fetched stripe_customer_id response:', result);

                // Check if the result is successful and the stripe_customer_id exists
                if (result.success && result.stripeCustomerId) {
                    setStripeCustomerId(result.stripeCustomerId);
                    console.log('Stripe Customer ID:', result.stripeCustomerId);

                    // Fetch subscription details using the customer ID
                    fetchSubscriptionDetails(result.stripeCustomerId);
                } else {
                    console.warn('No Stripe customer ID found, defaulting to free tier');
                    // setSelectedTier('free-trial'); // Default to free tier if no customer ID
                    // setPointerToFreeTrial(true);
                }
            } catch (error) {
                // Handle any errors during the fetch process
                console.error('Error fetching stripe_customer_id:', error);
                // setSelectedTier('free-trial'); // Default to free tier on error
                // setPointerToFreeTrial(true);
            }
        };

        // Fetch subscription details from Stripe
        const fetchSubscriptionDetails = async (stripeCustomerId) => {
            try {
                const response = await fetch(`/api/get-subscription-details/${stripeCustomerId}`);
                const subscriptionData = await response.json();

                if (subscriptionData && subscriptionData.subscription && subscriptionData.subscription.status === 'active') {
                    // Only true if the subscription is active
                    console.log('Active subscription with price id:', subscriptionData.subscription.price_id);

                    setSubscriptionId(subscriptionData.subscription.id);
                    setSubscriptionStatus(subscriptionData.subscription.status);
                    setSelectedTier(subscriptionData.subscription.price_id);
                    setCurrentPaymentId(subscriptionData.subscription.price_id); // Set to the current tier
                    setSelectedPrice(subscriptionData.subscription.price);  // Assuming price is returned in subscriptionData

                    // Set whether the subscription is scheduled to cancel at the end of the billing period
                    setSubscriptionWillEndAtPeriodEnd(subscriptionData.subscription.cancel_at_period_end);
                    // Set the end date of the current billing period
                    const billingPeriodEndDate = new Date(subscriptionData.subscription.current_period_end * 1000); // Convert UNIX timestamp to JS Date
                    setBillingPeriodEndDate(billingPeriodEndDate);
                    
                    setCurrentAccessType('stripe_subscription');
                    setPointerToSubscribed(true);

                    // Check if the subscription is scheduled to end at the end of the billing period and if the end date has passed
                    if (subscriptionData.subscription.cancel_at_period_end) {
                        const currentDate = new Date();
                        if (currentDate > billingPeriodEndDate) {
                                                // Call upsertUserAccess to update access to false and accessType to null
                    await upsertUserAccess(userId, userEmail, featureId, featureName, false, null, null, currentDate);
                        }
                    }

                } else {
                    console.log('There is no subscription');
                    // Uncomment or add any handling for the case where there's no active subscription if desired
                    // setSelectedTier('free-trial'); // Default to free tier if no subscription
                    // setPointerToFreeTrial(true);
                }
            } catch (error) {
                console.error('Error fetching subscription details:', error);
                // Uncomment or add any handling for errors if desired
                // setSelectedTier('free-trial'); // Default to free tier on error
                // setPointerToFreeTrial(true);
            }
        };

        fetchAccessType();
        if (!productId) {
            console.log("No productId provided, fetching all products.");
            fetchProducts();
        }
        else {
            console.log(" ProductId provided, fetching specific product.");
            fetchSpecificProduct(productId);
        }
        fetchStripeCustomerId();
        // console.log("beta pointer: ", pointerToBetaTester);
        // console.log("free_trial: ", (currentAccessType == 'free_trial')); 
        // console.log("first time: ", firstTime); 
        // console.log("beta code valid: ", !betaCodeValid);


    }, [userId, productId]);

    const handleTierClick = (price) => {
        if (currentPaymentId == price.id) {
            // console.log("current subscription", currentPaymentId, price.id);
            setChangeSubscriptionAttempt(false);
        }
        else {
            // console.log("different subscription: ", currentPaymentId, price.id);
            setChangeSubscriptionAttempt(true);
        }
        setPointerToBetaTester(false);
        setPointerToFreeTrial(false);  // Reset free trial state
        setPointerToSubscribed(true);
        setSelectedTier(price.id);
        setSelectedPrice(price);
    };

    const handleBetaTesterClick = () => {
        setSelectedTier('beta-tester');
        setPointerToBetaTester(true);
        setPointerToFreeTrial(false);
        setPointerToSubscribed(false); // Disable free trial when beta tester is selected
    };

    const handleFreeTrialClick = () => {
        setSelectedTier('free-trial');
        setPointerToFreeTrial(true);
        setPointerToBetaTester(false);
        setPointerToSubscribed(false);  // Disable beta tester when free trial is selected
    };

    const handleBetaCodeSubmit = async () => {
        try {
            // Validate the beta code using the utility function
            const result = await validateBetaCode(betaCode);

            // If the beta code is valid
            if (result.valid) {
                setIsCodeValid(true);

                console.log("Beta Code: ", betaCode);

                // Call the upsertUserAccess function to update user access
                await upsertUserAccess(userId, userEmail, featureId, featureName, true, 'beta_tester', betaCode, null);

                alert('Beta code accepted.');

                setFirstTime(false);
                setBetaCodeValid(true);
                setCurrentAccessType('beta_tester');  // Set the access type
            } else {
                // If the beta code is invalid
                setIsCodeValid(false);
                alert('Invalid beta code.');
            }
        } catch (error) {
            console.error('Error during beta code submission:', error);
        }
    };

    const startFreeTrial = async () => {

        await addFreeTrial(userId, userEmail, featureId, featureName);
        await upsertUserAccess(userId, userEmail, featureId, featureName, true, 'free_trial', null, null);

        alert('Free 1 day trial of key commander I started.');
        setFirstTime(false);
        setPointerToFreeTrial(true);
        setPointerToBetaTester(false);
        setPointerToSubscribed(false);
        setSelectedTier(null);
        setCurrentAccessType('free_trial');
    }

    const handleCancelSubscription = async () => {
        if (!subscriptionId) {
            alert('Subscription ID not found. Please try again later.');
            return;
        }

        setLoading(true);
        try {
            // Cancel the subscription
            const response = await fetch(`/api/cancel-subscription`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ subscriptionId }),
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Cancel subscription response:', result);

                let periodEnd = result.current_period_end;
                console.log('periodEnd: ', periodEnd);

                // Only fetch details if periodEnd is missing and we have a valid stripeCustomerId
                if (!periodEnd && stripeCustomerId) {
                    console.log('Fetching subscription details for customer:', stripeCustomerId);
                    const detailsResponse = await fetch(`/api/get-subscription-details/${stripeCustomerId}`);
                    if (detailsResponse.ok) {
                        const subscriptionData = await detailsResponse.json();
                        periodEnd = subscriptionData.subscription?.current_period_end;
                    }
                }

                if (!periodEnd) {
                    throw new Error('Could not retrieve subscription end date');
                }

                const endDate = new Date(periodEnd * 1000);
                if (isNaN(endDate.getTime())) {
                    throw new Error('Invalid date conversion');
                }

                setBillingPeriodEndDate(endDate);
                setSubscriptionWillEndAtPeriodEnd(true);

                const formattedDate = endDate.toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });

                alert(`Subscription cancellation scheduled. Your access will continue until ${formattedDate}`);

                setFirstTime(false);
                setFreeTrialExpired(true);
                setPointerToFreeTrial(false);
                setPointerToBetaTester(false);
                setPointerToSubscribed(true);
            } else {
                const errorData = await response.json();
                console.error('Error details:', errorData);
                alert('Failed to schedule subscription cancellation: ' + (errorData.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error canceling subscription:', error);
            alert('An error occurred while scheduling the subscription cancellation.');
        } finally {
            setLoading(false);
        }
    };

    const handleReactivateSubscription = async () => {
        if (!subscriptionId) {
            alert('Subscription ID not found. Please try again later.');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/reactivate-subscription`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ subscriptionId }),
            });

            if (response.ok) {
                const result = await response.json();
                alert('Subscription reactivated successfully!');
                // Update the frontend to show that the subscription is active
                setSubscriptionWillEndAtPeriodEnd(false);
            } else {
                const errorData = await response.json();
                console.error('Error details:', errorData);
                alert('Failed to reactivate subscription: ' + errorData.error);
            }
        } catch (error) {
            console.error('Error reactivating subscription:', error);
            alert('An error occurred while reactivating the subscription.');
        } finally {
            setLoading(false);
        }
    };

    const handleScheduleNewSubscription = async () => {
        if (!subscriptionId || !stripeCustomerId) {
            alert('Subscription ID or Customer ID not found. Please try again later.');
            return;
        }

        if (!selectedTier) {
            alert('Please select a new subscription tier first.');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/schedule-new-subscription`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerId: stripeCustomerId,
                    currentSubscriptionId: subscriptionId,
                    newPriceId: selectedTier,
                }),
            });

            if (response.ok) {
                const result = await response.json();
                alert(`New subscription scheduled successfully!`);
                // Update state to reflect the pending change
                setNextSubscriptionId(result.newSubscriptionId);
                setNextSubscriptionStartDate(new Date(result.startDate * 1000));
            } else {
                const errorData = await response.json();
                console.error('Error details:', errorData);
                alert('Failed to schedule new subscription: ' + errorData.error);
            }
        } catch (error) {
            console.error('Error scheduling new subscription:', error);
            alert('An error occurred while scheduling the new subscription.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="upgrade-container">
            {products.map((product) => (
                <div key={product.id} className="product-container">
                    <div className="product-info">
                        {product.images && product.images.length > 0 && (
                            <img src={product.images[0]} alt={product.name} className="product-image" />
                        )}
                        <div className="name-and-description">
                            <h1>{product.name}</h1>
                            <p>{product.description}</p>
                        </div>
                    </div>

                    <div className="price-options-horizontal"> 
                    
                        {freeTrialAvailable && !freeTrialExpired
                            && !(currentAccessType == 'stripe_subscription')
                            && !(currentAccessType == 'beta_tester') &&
                            <Tier
                                key="free-trial"
                                title="Try for free"
                                text="Free 1 day trial."
                                selected={pointerToFreeTrial}
                                onClick={handleFreeTrialClick}
                            />}

                        {/* Render other product price tiers */}
                        {(Array.isArray(product.prices) ? product.prices : [])
                            .filter(price => price.active !== false) // Filter out archived prices
                            .map(price => (
                            <Tier
                                key={price.id}
                                title={`$${(price.unit_amount / 100).toFixed(2)} ${price.currency.toUpperCase()}`}
                                text={
                                    price.recurring
                                        ? `Recurring every ${price.recurring.interval_count} ${price.recurring.interval}<br>Cancel any time`
                                        : 'One-time payment'
                                }
                                selected={selectedTier === price.id}
                                onClick={() => handleTierClick(price)}
                            />
                        ))}

                        {/* Add Beta Tester Option */}
                        {betaTesting && (
                            <Tier
                                key="beta-tester"
                                title="Beta Tester"
                                text="Use the contact form to request beta-tester access code."
                                selected={pointerToBetaTester}
                                onClick={handleBetaTesterClick}
                            />
                        )}
                    </div>

                    <div>
                        {pointerToFreeTrial && freeTrialAvailable && (firstTime) && 
                            <div className="beta-tester">
                                <h2>Start your 1 day free trial now.</h2>
                                <button className="pay-select-button" onClick={startFreeTrial}>
                                    Start Free Trial
                                </button>   </div>}

                        {pointerToFreeTrial && freeTrialAvailable && (currentAccessType == 'free_trial') &&
                            <div>
                                <h2> You are on a free 1 day trial.</h2>
                            </div>}

                        {pointerToFreeTrial && freeTrialAvailable && currentAccessType == 'stripe_subscription' &&
                            <div>
                                <h2> You are subscribed. Press 'cancel subscription' to go back to the free tier. You are likely to lose access if your free trial period has expired.</h2>
                            </div>}

                        {freeTrialAvailable && freeTrialExpired && !(pointerToSubscription) && !(pointerToBetaTester) && (
                            <div className="beta-tester">
                                <h2>Your free trial has expired. Subscribe to access this feature. </h2>
                            </div>
                        )}

                        {pointerToSubscription && changeSubscriptionAttempt && !subscriptionWillEndAtPeriodEnd && currentAccessType == 'stripe_subscription' &&
                            <div>
                                <h2>You are already subscribed. Cancel your current subscription to get a different one.</h2>
                            </div>
                        }

                        {pointerToSubscription && changeSubscriptionAttempt && subscriptionWillEndAtPeriodEnd && currentAccessType == 'stripe_subscription' &&
                            <div>
                                <h2>You can schedule a change to this tier starting {billingPeriodEndDate ? billingPeriodEndDate.toLocaleDateString() : 'at the end of your current period'}.</h2>
                            </div>
                        }

                        {pointerToSubscription && !changeSubscriptionAttempt && currentAccessType === 'stripe_subscription' && (
                            subscriptionWillEndAtPeriodEnd ? (
                                <div className="pt-4 text-base">
                                <h2>
                                    Your subscription has been canceled.<br />
                                    You will have access until {billingPeriodEndDate.toLocaleDateString()}.<br />
                                    You can reactivate your subscription at any time.
                                </h2>
                            </div>
                            ) : (
                                <div className="pt-4 text-base">
                                    <h2>You are subscribed. You have full access to this feature.</h2>
                                </div>
                            )
                        )}

                        {pointerToBetaTester && betaTesting && currentAccessType == 'stripe_subscription' && (
                            <div className="beta-tester">
                                <h2>You currently have access due to your subscription. No additional functionalities are available as a beta tester.</h2>
                            </div>
                        )}

                        {pointerToBetaTester && betaTesting && currentAccessType === 'beta_tester' &&
                            <div>
                                <h2> You currently have full access to this feature as a beta tester.</h2>
                            </div>}

                        {/* Render Beta Tester code input if beta tester is selected */}
                        {pointerToBetaTester && betaTesting && (!(currentAccessType == 'stripe_subscription')) && ((currentAccessType == 'free_trial') || firstTime || (!(betaCodeValid))) && (
                            <div className="beta-tester">
                                <h2>{explanation} To access this feature as a beta tester, please enter the current access code.</h2>
                                <input
                                    type="text"
                                    placeholder="Enter Code"
                                    value={betaCode}
                                    onChange={(e) => setBetaCode(e.target.value)}
                                />
                                <button className="pay-select-button"
                                    onClick={handleBetaCodeSubmit}>Submit Code</button>
                                {isCodeValid && <p>Welcome, Beta Tester!</p>}
                            </div>
                        )}

                        {/* Render Stripe subscription for normal tiers */}
                        {!(currentAccessType == 'stripe_subscription') && !pointerToBetaTester && !pointerToFreeTrial && selectedPrice && (
                            <StripeSubscription
                                priceId={selectedTier}
                                selectedPrice={selectedPrice}
                                stripeCustomerId={stripeCustomerId}
                                userId={userId}
                                userEmail={userEmail}
                                setChangeSubscriptionAttempt={setChangeSubscriptionAttempt}
                                setCurrentAccessType={setCurrentAccessType}
                                setSubscriptionStatus={setSubscriptionStatus}
                                setSubscriptionId={setSubscriptionId}
                                setCurrentPaymentId={setCurrentPaymentId}
                            />
                        )}

                    </div>
                </div>
            ))}

            {subscriptionStatus && subscriptionStatus !== 'canceled' && !subscriptionWillEndAtPeriodEnd && (
                <div className="cancel-subscription">
                    <button className="pay-select-button"
                        onClick={handleCancelSubscription} disabled={loading}>
                        {loading ? 'Cancelling...' : 'Cancel Subscription'}
                    </button>
                </div>
            )}

            {pointerToSubscription && !changeSubscriptionAttempt &&
                currentAccessType === 'stripe_subscription' &&
                subscriptionWillEndAtPeriodEnd && billingPeriodEndDate &&
                (<div className="cancel-subscription">
                   {/*  <div className="subscription-info">
                        <p>Current subscription ends: {billingPeriodEndDate.toLocaleDateString()}</p>
                    </div> */}
                    <button className="pay-select-button"
                        onClick={handleReactivateSubscription} disabled={loading}>
                        {loading ? 'Reactivating...' : 'Reactivate Subscription'}
                    </button>
                </div>
                )}

            {pointerToSubscription && changeSubscriptionAttempt &&
                currentAccessType === 'stripe_subscription' &&
                subscriptionWillEndAtPeriodEnd && billingPeriodEndDate &&
                (<div className="cancel-subscription">
                    <div className="subscription-info">
                        <p>New subscription will start: {billingPeriodEndDate.toLocaleDateString()}</p>
                    </div>
                    <button className="pay-select-button"
                        onClick={handleScheduleNewSubscription} disabled={loading}>
                        {loading ? 'Scheduling change...' : 'Schedule Subscription Change'}
                    </button>
                </div>
                )}



        </div>
    );
};

export default Upgrade;