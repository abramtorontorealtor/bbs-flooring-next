/**
 * Financeit payment estimation utilities
 * Based on Standard Credit (13.99%) at maximum amortization
 * Under $10K: 15-year amortization, factor 0.01351
 * $10K+:      20-year amortization, factor 0.01331 + $1.98 fee
 */

export const FINANCEIT_LINKS = {
  freeProgram:  'https://www.financeit.ca/s/qxTmNQ', // Fixed Rate — standard, always available
  deferral3mo:  'https://www.financeit.ca/s/o18MGQ', // 3 Months No Payments, No Interest
  rate36mo:     'https://www.financeit.ca/s/0f1VNg', // 36 Months at 10.99%
};

/**
 * Returns the estimated monthly payment for a given loan amount.
 * Uses max amortization at 13.99% (Free Program, no merchant fee).
 * Returns null if amount is below $1,000 minimum.
 */
export function getMonthlyPayment(amount) {
  if (!amount || amount < 1000) return null;
  if (amount < 10000) {
    return Math.ceil(amount * 0.01351);
  }
  return Math.ceil(amount * 0.01331 + 1.98);
}
