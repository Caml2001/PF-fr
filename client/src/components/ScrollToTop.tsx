import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * Componente que desplaza la ventana al inicio cuando la ubicación cambia
 */
export function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
}

export default ScrollToTop; 