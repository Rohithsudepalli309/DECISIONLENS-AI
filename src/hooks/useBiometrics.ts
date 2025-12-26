
import { useState, useCallback } from 'react';

export const useBiometrics = () => {
  const [isSupported, setIsSupported] = useState<boolean>(false);

  // Check for biometric support on mount
  useState(() => {
    if (typeof window !== 'undefined' && window.PublicKeyCredential) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then(setIsSupported)
        .catch(() => setIsSupported(false));
    }
  });

  const registerBiometrics = useCallback(async (username: string) => {
    if (!isSupported) return null;

    try {
      // Mock challenge from server
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: "DecisionLens AI" },
          user: {
            id: new Uint8Array(16),
            name: username,
            displayName: username
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required"
          }
        }
      });

      return credential;
    } catch (err) {
      console.error("Biometric registration failed:", err);
      return null;
    }
  }, [isSupported]);

  const verifyBiometrics = useCallback(async () => {
    if (!isSupported) return false;

    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials: [], // In real world, this would be populated from backend
          userVerification: "required"
        }
      });

      return !!assertion;
    } catch (err) {
      console.error("Biometric verification failed:", err);
      return false;
    }
  }, [isSupported]);

  return { isSupported, registerBiometrics, verifyBiometrics };
};
