import { useState, useCallback, useEffect } from 'react';

export const useBiometrics = () => {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isRegistered, setIsRegistered] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dl_biometrics_enabled') === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.PublicKeyCredential) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then(setIsSupported)
        .catch(() => setIsSupported(false));
    }
  }, []);

  const registerBiometrics = useCallback(async (username: string) => {
    if (!isSupported) return null;

    try {
      // In a real app, this challenge would come from the backend
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: "DecisionLens AI", id: window.location.hostname },
          user: {
            id: new TextEncoder().encode(username),
            name: username,
            displayName: username
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" }, // ES256
            { alg: -257, type: "public-key" } // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
            residentKey: "preferred"
          },
          timeout: 60000,
          attestation: "none"
        }
      });

      if (credential) {
        localStorage.setItem('dl_biometrics_enabled', 'true');
        setIsRegistered(true);
      }
      return credential;
    } catch (err) {
      console.error("Biometric registration failed:", err);
      throw err;
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
          timeout: 60000,
          userVerification: "required"
        }
      });

      return !!assertion;
    } catch (err) {
      console.error("Biometric verification failed:", err);
      return false;
    }
  }, [isSupported]);

  return { isSupported, isRegistered, registerBiometrics, verifyBiometrics };
};
