import { fetchFeatureAccess, validateBetaCode } from '@/src/interfaces/apiSQLfrontend';  // Assuming fetchFeatureAccess is in the same project
import { isMoreThanTwoDaysAgo} from './utility';

export const checkAccess = async (userId, feature_ID, feature_name) => {
    let returnObject = {
        data: false,
        access: false,
        message: ''
    };

    console.log("in: checkAccess");
    try {
        // Fetch all feature access data for the user
        const accessData = await fetchFeatureAccess(userId);

        // Check if there is any data
        if (!accessData.found_data) {
            console.log("no data found");
            returnObject.data = false;
            returnObject.access = false;
            returnObject.message = 'A free 1 day trial is available for you.';
        };

        console.log("accessData: ", accessData);

        // Find the specific feature by feature_ID and feature_name
        const featureAccess = accessData.access.find(accessItem =>
            accessItem.feature_ID === feature_ID && accessItem.feature_name === feature_name
        );

        if (featureAccess) {
            console.log("data found");
            returnObject.data = true;
            returnObject.access_type = featureAccess.access_type
            switch (featureAccess.access_type) {
                case 'free_trial':
                    const someDate = new Date(featureAccess.transaction_date); // Replace with your date
                    if (isMoreThanTwoDaysAgo(someDate)) {
                        console.log("free trial started more than 2 days ago.");
                        returnObject.access = false;
                        returnObject.message = 'Your free 1 day trial has expired.';
                        returnObject.freeTrialExpired = true;
                    } else {
                        console.log("free trial is still going.");
                        returnObject.access = true;
                        returnObject.freeTrialExpired = false;
                    }
                    break;
                case 'stripe_subscription':
                    returnObject.freeTrialAvailable = false;
                    returnObject.access = true;
                    break;
                case 'beta_tester':
                    returnObject.beta_code = featureAccess.beta_code;
                    console.log('beta_tester');
                    const validate = await validateBetaCode(featureAccess.beta_code)
                    if (validate.valid) {
                        returnObject.access = true;
                        returnObject.betaCodeExpired = false;
                    }
                    else {
                        returnObject.access = false;
                        returnObject.message = 'Your beta-tester code has expired.';
                        returnObject.betaCodeExpired = true;
                    }
                    break;
                default:
                    returnObject.access = false;
                    break;
            }
        }
        else {
            // user has been found, but no access data for this feature
            returnObject.access = false;
            returnObject.message = 'A free 1 day trial is available for you.';
        }
    } catch (error) {
        console.error('Error checking access:', error);
        // Return an error state with no data
        returnObject.access = false;
    };
    return returnObject;
};
