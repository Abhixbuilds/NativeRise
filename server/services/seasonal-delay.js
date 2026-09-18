/**
 * Seasonal & Road-Condition-Aware ETA Rules
 * Static rule-based lookup for MVP
 * Maps month and state/region to potential extra transit days
 */

// Monsoon and high-altitude seasonal delay rules
const seasonalDelayRules = [
  { months: [6, 7, 8, 9], states: ['Maharashtra', 'Kerala', 'Assam', 'West Bengal', 'Goa', 'Uttarakhand'], extraDays: 2, reason: 'Heavy monsoon road disruptions' },
  { months: [11, 12, 1], states: ['Himachal Pradesh', 'Jammu and Kashmir', 'Uttarakhand', 'Punjab'], extraDays: 3, reason: 'Dense winter fog and hill passes delays' },
  { months: [4, 5], states: ['Rajasthan', 'Gujarat'], extraDays: 1, reason: 'Extreme summer afternoon road restrictions' }
];

const checkSeasonalDelay = (destinationState = '') => {
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const normalizedState = destinationState.trim().toLowerCase();

  for (const rule of seasonalDelayRules) {
    if (rule.months.includes(currentMonth)) {
      const stateMatch = rule.states.some(s => s.toLowerCase() === normalizedState || normalizedState.includes(s.toLowerCase()));
      if (stateMatch) {
        return {
          weatherAdjustedDelay: true,
          extraDays: rule.extraDays,
          reason: rule.reason
        };
      }
    }
  }

  return {
    weatherAdjustedDelay: false,
    extraDays: 0,
    reason: ''
  };
};

module.exports = { checkSeasonalDelay, seasonalDelayRules };
