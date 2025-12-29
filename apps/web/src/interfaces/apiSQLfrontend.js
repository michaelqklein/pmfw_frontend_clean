const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed in JS
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`; // Returns 'YYYY-MM-DD'
};

// checks login against login data stored in backend.
export const login = async (formData) => {
    try {
        // Send POST request to backend for login
        // const response = await fetch('http://localhost:3000/login', {
        const response = await fetch('api/login', {
     
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        // Check response from backend
        if (data.success) {
            const user = data.user;
            return user;  // Return the user data
        } else {
            throw new Error('Login failed. Please check your credentials.');
        }
    } catch (error) {
        console.error('Error during login:', error);
        throw error;  // Propagate error to be handled in the calling function
    }
};

// check free trial database
export const checkFreeTrial = async (user_ID, feature_ID) => {
    try {
        // Send POST request to backend for free trial check
        const response = await fetch('http://localhost:3000/api/check-free-trial', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_ID, feature_ID }),
        });

        // Parse and return the JSON response directly
        const result = await response.json();
        return result;

    } catch (error) {
        console.error('Error checking free trial:', error);
        throw error; // Propagate error to be handled by calling function
    }
};

// Utility function to add a new free trial entry
export const addFreeTrial = async (userId, userEmail, featureId, featureName) => {
    // Set start date to today and expiration date to two days from today
    const startDate = new Date();
    const expirationDate = new Date(startDate);
    expirationDate.setDate(startDate.getDate() + 2);

    // Format dates to YYYY-MM-DD for MySQL
    const start_date = startDate.toISOString().split('T')[0];
    const expiration_date = expirationDate.toISOString().split('T')[0];

    console.log('user_ID:', userId);
    console.log('email_address:', userEmail);
    console.log('feature_ID:', featureId);
    console.log('feature_name:', featureName);
    console.log('start_date:', start_date);
    console.log('expiration_date:', expiration_date);

    const payload = {
        user_ID: userId,
        email_address: userEmail,
        feature_ID: featureId,
        feature_name: featureName,  // Replace with appropriate default
        start_date: start_date,
        expiration_date: expiration_date}

    try {
        // Send POST request to add the free trial
        const response = await fetch('http://localhost:3000/api/add-free-trial', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        // Parse and return the response JSON
        const result = await response.json();
        return result;

    } catch (error) {
        console.error('Error adding free trial:', error);
        return { success: false, message: error.message };
    }
};


// calls backend to get feature access for user_ID
// This is called before accessing a feature
export const fetchFeatureAccess = async (userId) => {
    try {
        // Send GET request to backend for user feature access
        const response = await fetch(`/api/user-feature-access/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        // Check if the network response was successful
        if (!response.ok) {
            throw new Error(`Network response was not ok. Status: ${response.status}`);
        }

        const data = await response.json();
        return data

    } catch (error) {
        console.error('Error fetching feature access:', error);
        // Return an object for error state, so calling function can handle it
        return { hasAccess: false, message: error.message, access: [] };
    }
};

// Example upsertUserAccess function call with formatted transaction date
export const upsertUserAccess = async (userId, userEmail, featureId, featureName, access, accessType, betaCode, transactionDate) => {
    // Use today's date if no transactionDate is provided
    const formattedDate = formatDate(transactionDate || new Date());

    // Default undefined values to null or an appropriate default value
    console.log("beta Code: ", betaCode);

    const payload = {
        user_ID: userId || null,
        user_email: userEmail || null,
        feature_ID: featureId || 1,
        feature_name: featureName || 'KCI',  // Replace with appropriate default
        access: access || false,
        access_type: accessType || null,  // Replace with appropriate default
        beta_code: betaCode || null,
        transaction_date: formattedDate || null
    };

    try {
        const response = await fetch('/api/upsert-feature-access', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Failed to upsert user access');
        }

        console.log('Feature access upserted:', result);
    } catch (error) {
        console.error('Error upserting user access:', error);
    }
};

// Function to update Stripe customer ID in SQL
export const updateStripeCustomerId = async (userId, stripeCustomerId) => {
    try {
        const response = await fetch('/api/update-stripe-customer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_ID: userId,
                stripe_customer_id: stripeCustomerId,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('Failed to update Stripe Customer ID:', response.status);
            throw new Error(result.error || 'Failed to update Stripe Customer ID');
        }

        console.log('Stripe Customer ID updated successfully!');
        return result;
    } catch (error) {
        console.error('Error updating Stripe Customer ID:', error);
        throw error; // Re-throw the error to be caught by the caller
    }
};

// Utility function to validate beta code with the backend
export const validateBetaCode = async (betaCode) => {
    try {
        const response = await fetch('http://localhost:3000/api/validate-beta-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ betaCode }),
        });

        const result = await response.json();

        // Return the validation result
        return result;
    } catch (error) {
        console.error('Error validating beta code:', error);
        throw error;  // Propagate the error
    }
};
