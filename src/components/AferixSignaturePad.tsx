import React from 'react';
import { SignaturePad, type SignaturePadProps } from '../features/execution/components/SignaturePad';

export type AferixSignaturePadProps = SignaturePadProps;

/**
 * AferixSignaturePad: Re-export alias for canonical SignaturePad.
 * Aligned with Aferix Dark Premium V12 design system.
 */
export const AferixSignaturePad: React.FC<AferixSignaturePadProps> = (props) => {
  return <SignaturePad {...props} />;
};

export { SignaturePad };
export default AferixSignaturePad;
