
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMobileDetect } from "@/hooks/use-mobile";

const IndexPage = () => {
  const navigate = useNavigate();
  const isMobile = useMobileDetect();

  // Redireccionar automáticamente al dashboard
  useEffect(() => {
    // Redirigir al dashboard después de un breve retraso
    const timer = setTimeout(() => {
      navigate('/');
    }, 100);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">¡Bienvenido!</CardTitle>
            <CardDescription className="text-center">
              Sistema de Administración de Vehículos
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p>Serás redirigido al panel de control en unos momentos...</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate('/')}>
              Ir al Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default IndexPage;
