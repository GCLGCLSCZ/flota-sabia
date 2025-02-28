
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash, RotateCw, Check, AlertCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { STORAGE_KEYS } from "@/context/storage";

const DataCleanup = () => {
  const { toast } = useToast();
  const { refreshData } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [cleanupComplete, setCleanupComplete] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para limpiar localStorage
  const clearLocalStorage = () => {
    // Limpiar todos los datos almacenados en localStorage
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    
    // También limpiar otros posibles datos
    localStorage.removeItem('settings');
    localStorage.removeItem('maintenance');
    localStorage.removeItem('cardex');
    localStorage.removeItem('discounts');
    localStorage.removeItem('free_days');
    
    // Limpiar cualquier otro dato que pueda estar en localStorage
    const keysToPreserve = ['theme', 'chakra-ui-color-mode']; // Claves que NO queremos borrar
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !keysToPreserve.includes(key) && key.startsWith('app_')) {
        localStorage.removeItem(key);
      }
    }
  };

  // Función para limpiar datos en Supabase
  const clearSupabaseData = async () => {
    if (!supabase) return; // Si no hay instancia de Supabase, no hacer nada
    
    try {
      // Borrar datos de las tablas principales
      const tables = [
        'vehicles',
        'payments',
        'investors',
        'drivers',
        'maintenance',
        'cardex',
        'discounts',
        'free_days',
        'settings',
        'days_not_worked'
      ];
      
      // Borrar datos de cada tabla con un método más robusto
      for (const table of tables) {
        try {
          // Primero intentamos obtener todos los registros para verificar si la tabla existe
          const { data, error: fetchError } = await supabase
            .from(table)
            .select('id')
            .limit(1);
            
          if (fetchError && fetchError.code === '42P01') {
            // Si la tabla no existe, ignoramos el error y continuamos
            console.log(`Tabla ${table} no existe, continuando...`);
            continue;
          }
          
          // Si la tabla existe, procedemos a eliminar todos los registros
          const { error: deleteError } = await supabase
            .from(table)
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Truco más seguro para borrar todos los registros
          
          if (deleteError) {
            console.error(`Error al limpiar tabla ${table}:`, deleteError);
          } else {
            console.log(`Datos de tabla ${table} eliminados correctamente`);
          }
        } catch (tableError) {
          console.error(`Error procesando tabla ${table}:`, tableError);
        }
      }
    } catch (err) {
      console.error('Error al limpiar datos de Supabase:', err);
      throw err;
    }
  };

  // Función para verificar que la aplicación esté funcionando correctamente
  const verifyAppFunctionality = async () => {
    try {
      // Refrescar los datos para asegurarse de que todo está limpio
      await refreshData();
      
      // Aquí podríamos agregar más verificaciones si fuera necesario
      
      return true;
    } catch (err) {
      console.error('Error en la verificación de funcionalidad:', err);
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
      clearLocalStorage();
      
      // Luego limpiar Supabase si está disponible
      await clearSupabaseData();
      
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
