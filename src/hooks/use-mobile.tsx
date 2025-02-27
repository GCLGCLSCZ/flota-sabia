
import { useState, useEffect } from "react";

export function useMobileDetect(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
    };

    // Verificar al inicio
    checkIfMobile();

    // Agregar listener para resize
    window.addEventListener("resize", checkIfMobile);

    // Limpiar listener
    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  return isMobile;
}

// Añadimos un alias para compatibilidad
export const useIsMobile = useMobileDetect;
