import { useMonthlyTokenReset } from '@/hooks/useMonthlyTokenReset';

/**
 * TokenResetWrapper component that handles monthly token resets
 * This component runs the token reset check on every app load
 */
export const TokenResetWrapper = () => {
  // This hook automatically checks and resets tokens when the user is authenticated
  useMonthlyTokenReset();
  
  // This component doesn't render anything, it just runs the hook
  return null;
};
