
export const isMoreThanTwoDaysAgo = (date) => {
    const now = new Date(); // Current date
    const twoDaysAgo = new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000)); // Subtract 2 days (in ms)

    return date < twoDaysAgo; // Check if the given date is before 2 days ago
};
