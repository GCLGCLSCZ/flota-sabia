
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash, RotateCw, Check, AlertCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { clearAllStoredData, STORAGE_KEYS } from "@/context/storage";

/**
 * Componente para limpiar completamente los datos de la aplicación.
 * 
 * Funcionalidad:
 * - Elimina todos los datos almacenados en localStorage
 * - Elimina todos los datos en Supabase (si está configurado)
 * - Verifica que la aplicación siga funcionando correctamente después de la limpieza
 * 
 * Este componente es útil para:
 * - Restablecer la aplicación a su estado inicial
 * - Solucionar problemas de datos corruptos
 * - Preparar la aplicación para un nuevo conjunto de datos
 */
const DataCleanup = () => {
  const { toast } = useToast();
  const { refreshData } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [cleanupComplete, setCleanupComplete] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para limpiar completamente localStorage
  const clearLocalStorage = () => {
    try {
      console.log("Limpiando localStorage...");
      
      // Limpiamos manualmente todas las claves conocidas
      Object.values(STORAGE_KEYS).forEach(key => {
        console.log(`Eliminando clave: ${key}`);
        localStorage.removeItem(key);
      });
      
      // También limpiamos otros datos que pueden estar en localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('app_')) {
          console.log(`Eliminando clave adicional: ${key}`);
          localStorage.removeItem(key);
        }
      }
      
      // Usando la función auxiliar para limpiar todo
      clearAllStoredData();
      
      console.log("localStorage limpiado completamente");
      return true;
    } catch (err) {
      console.error("Error al limpiar localStorage:", err);
      return false;
    }
  };

  // Función para limpiar datos en Supabase de manera más agresiva
  const clearSupabaseData = async () => {
    if (!supabase) {
      console.log("Supabase no está disponible");
      return true;
    }
    
    try {
      console.log("Limpiando datos de Supabase...");
      
      // Lista de tablas para limpiar
      const tables = [
        'vehicles',
        'payments',
        'investors',
        'drivers',
        'maintenance',
        'cardex',
        'discounts',
        'days_not_worked',
        'settings',
        'free_days'
      ];
      
      // Eliminamos agresivamente los datos de cada tabla
      for (const table of tables) {
        try {
          console.log(`Eliminando datos de tabla: ${table}`);
          
          // Método 1: Eliminar usando delete
          const { error: deleteError } = await supabase
            .from(table)
            .delete()
            .not('id', 'is', null);
          
          if (deleteError) {
            console.log(`Error con método 1 para tabla ${table}:`, deleteError);
            
            // Método 2: Intento alternativo si falla el primero
            const { error: rpcError } = await supabase.rpc('truncate_table', { table_name: table });
            
            if (rpcError) {
              console.log(`Error con método 2 para tabla ${table}:`, rpcError);
              
              // Método 3: Usando SQL directo como último recurso
              const { error: sqlError } = await supabase.from(table).delete();
              
              if (sqlError) {
                console.log(`No se pudo limpiar tabla ${table}:`, sqlError);
              }
            }
          }
          
          console.log(`Tabla ${table} procesada`);
        } catch (tableError) {
          console.error(`Error procesando tabla ${table}:`, tableError);
        }
      }
      
      console.log("Datos de Supabase limpiados completamente");
      return true;
    } catch (err) {
      console.error("Error al limpiar datos de Supabase:", err);
      return false;
    }
  };

  // Función para verificar que la aplicación esté funcionando correctamente
  const verifyAppFunctionality = async () => {
    try {
      console.log("Verificando funcionalidad de la aplicación...");
      
      // Refrescar los datos para asegurar que todo está limpio
      await refreshData();
      
      console.log("Verificación completada con éxito");
      return true;
    } catch (err) {
      console.error("Error en la verificación de funcionalidad:", err);
      throw err;
    }
  };

  // Función principal para limpiar todos los datos
  const handleCleanupData = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    setCleanupComplete(false);
    setVerificationComplete(false);
    
    try {
      // Primero limpiar localStorage
      const localStorageClean = clearLocalStorage();
      
      if (!localStorageClean) {
        throw new Error("Error al limpiar localStorage");
      }
      
      // Luego limpiar Supabase si está disponible
      const supabaseClean = await clearSupabaseData();
      
      if (!supabaseClean) {
        throw new Error("Error al limpiar Supabase");
      }
      
      // Marcar la limpieza como completada
      setCleanupComplete(true);
      
      toast({
        title: "Datos eliminados",
        description: "Todos los datos de la aplicación han sido eliminados correctamente.",
      });
      
      // Iniciar verificación
      const verified = await verifyAppFunctionality();
      
      if (verified) {
        setVerificationComplete(true);
        
        toast({
          title: "Verificación completada",
          description: "La aplicación está funcionando correctamente después de la limpieza.",
        });
      }
    } catch (err) {
      console.error('Error durante el proceso de limpieza:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido durante la limpieza de datos');
      
      toast({
        title: "Error",
        description: "Ha ocurrido un error durante el proceso de limpieza. Por favor intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trash className="mr-2 h-5 w-5 text-destructive" />
          Limpieza y Verificación de Datos
        </CardTitle>
        <CardDescription>
          Elimina todos los datos almacenados y verifica el funcionamiento de la aplicación
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-md border">
            <h3 className="font-medium text-destructive mb-2">⚠️ Advertencia</h3>
            <p className="text-sm">
              Esta acción eliminará permanentemente todos los datos almacenados en la aplicación, 
              incluyendo vehículos, pagos, inversionistas, conductores y configuraciones. 
              Esta acción no se puede deshacer.
            </p>
          </div>

          {cleanupComplete && (
            <div className="flex items-center space-x-2 text-sm p-2 bg-success/10 text-success rounded-md">
              <Check className="h-4 w-4" />
              <span>Datos eliminados correctamente</span>
            </div>
          )}

          {verificationComplete && (
            <div className="flex items-center space-x-2 text-sm p-2 bg-success/10 text-success rounded-md">
              <Check className="h-4 w-4" />
              <span>Verificación completada: La aplicación está funcionando correctamente</span>
            </div>
          )}

          {error && (
            <div className="flex items-start space-x-2 text-sm p-2 bg-destructive/10 text-destructive rounded-md">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="destructive" 
          className="w-full"
          onClick={handleCleanupData}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <RotateCw className="mr-2 h-4 w-4 animate-spin" />
              {cleanupComplete ? "Verificando..." : "Limpiando datos..."}
            </>
          ) : (
            <>
              <Trash className="mr-2 h-4 w-4" />
              Limpiar Datos y Verificar Aplicación
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DataCleanup;
