/**
 * Utility functions for string manipulation and extraction.
 */

/**
 * Extracts a leading numbered bullet (like "1.", "12.") from text.
 * @param {string} text - The input text
 * @returns {string|null} - The matched string or null
 */
export const extractClauseNumber = (text) => {
    const match = text?.match(/^(\d+\.)\s*/);
    return match ? match[1] : null;
};