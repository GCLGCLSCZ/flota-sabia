
import { useState, useEffect } from "react";

// Hook para detectar si estamos en una pantalla móvil
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Función para verificar si la pantalla es menor que el breakpoint
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Verificar al inicio
    checkMobile();

    // Añadir listener para resize
    window.addEventListener("resize", checkMobile);

    // Limpiar listener al desmontar
    return () => window.removeEventListener("resize", checkMobile);
  }, [breakpoint]);

  return isMobile;
}
