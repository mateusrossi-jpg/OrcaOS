import React, { type ReactNode } from 'react';
import { cn } from '../../utils/ui';
import { ScreenContainer, AppHeader as SystemAppHeader } from '../system';

interface AppScreenProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  isCinematic?: boolean;
}

/**
 * AppScreen: The definitive context for Aferix operations.
 * Refactored to use standardized ScreenContainer.
 */
export const AppScreen = ({ children, className, isCinematic = false, ...props }: AppScreenProps) => (
  <ScreenContainer className={className} {...props}>
    {children}
  </ScreenContainer>
);

export const AppHeader = SystemAppHeader;
