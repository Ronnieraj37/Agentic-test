// Utility functions
/**
 * Calculates the average of an array of numbers
 * @param {number[]} numbers - Array of numbers to average
 * @returns {number} The average value or 0 for empty arrays
 */
function average(numbers) {
  if (!Array.isArray(numbers) || numbers.length === 0) {
    return 0;
  }
  
  const sum = numbers.reduce((acc, val) => acc + val, 0);
  return sum / numbers.length;
}

/**
 * Add two numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} The sum of a and b
 */
function add(a, b) {
    return a + b;
  }
  
  /**
   * Subtract two numbers
   * @param {number} a - First number
   * @param {number} b - Second number
   * @returns {number} The difference between a and b
   */
  function subtract(a, b) {
    return a - b;
  }
  
  module.exports = {
    add,
    subtract
  };