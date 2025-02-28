
import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    
    // Comprobar inmediatamente
    checkMobile();
    
    // Configurar el listener para cambios de tamaño
    window.addEventListener('resize', checkMobile);
    
    // Limpiar
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

export function useMobileOpen() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const isMobile = useIsMobile();
  
  return {
    isMobile,
    mobileOpen,
    setMobileOpen
  };
}
