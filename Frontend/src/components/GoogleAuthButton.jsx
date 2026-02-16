import { Box, Text } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';

const GOOGLE_SCRIPT_ID = 'google-identity-services';
const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existing = document.getElementById(GOOGLE_SCRIPT_ID);
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('No se pudo cargar Google SDK')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar Google SDK'));
    document.head.appendChild(script);
  });
}

export default function GoogleAuthButton({ onSuccess, onError }) {
  const containerRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError('Falta configurar VITE_GOOGLE_CLIENT_ID en Frontend/.env');
      return;
    }

    let isMounted = true;
    loadGoogleScript()
      .then(() => {
        if (!isMounted || !containerRef.current || !window.google?.accounts?.id) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (!response?.credential) {
              const message = 'Google no devolvió credencial';
              setError(message);
              onError?.(message);
              return;
            }
            onSuccess?.(response.credential);
          },
        });

        containerRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(containerRef.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          width: 320,
        });
      })
      .catch((err) => {
        const message = err?.message || 'Error cargando Google SDK';
        setError(message);
        onError?.(message);
      });

    return () => {
      isMounted = false;
    };
  }, [onError, onSuccess]);

  return (
    <Box>
      <Box ref={containerRef} display="flex" justifyContent="center" />
      {error ? (
        <Text mt={2} fontSize="sm" color="red.500" textAlign="center">
          {error}
        </Text>
      ) : null}
    </Box>
  );
}
