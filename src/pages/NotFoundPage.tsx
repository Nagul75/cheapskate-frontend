import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function NotFoundPage() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/app");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-0 shadow-lg rounded-none">
        <CardHeader className="text-center pb-6 pt-8">
          <div className="text-6xl font-bold text-pink-600 dark:text-pink-400 mb-4">
            404
          </div>
          
          <CardTitle className="text-2xl font-bold text-foreground mb-2">
            Page Not Found
          </CardTitle>
          
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist.
          </p>
        </CardHeader>
        
        <CardContent className="text-center pb-8">
          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleGoHome}
              className="rounded-none w-full cursor-pointer"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
            
            <Button 
              onClick={handleGoBack} 
              variant="outline"
              className="rounded-none w-full cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
