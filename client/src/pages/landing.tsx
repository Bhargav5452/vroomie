import { Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";
import { useLocation } from "wouter";

export default function Landing() {
  const [, navigate] = useLocation();

  const handleGetStarted = () => {
    navigate("/register");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-blue-600 flex flex-col">
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div 
          className="w-full h-full opacity-20 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1200')"
          }}
        />
      </div>
      
      <Card className="relative z-10 bg-white rounded-t-3xl border-0 shadow-none">
        <div className="p-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Car className="text-white text-2xl" />
            </div>
            <h1 className="text-3xl font-bold text-text mb-2">Vroomie</h1>
            <p className="text-gray-600">Student-exclusive ride sharing</p>
          </div>
          
          <div className="space-y-4">
            <div className="text-center space-y-4">
              <p className="text-gray-600 text-sm">
                Join the student-exclusive ride sharing community
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>✓ Verified college students only</p>
                <p>✓ Smart buddy matching by college & branch</p>
                <p>✓ Earn points and save the environment</p>
              </div>
            </div>
            <Button 
              onClick={handleGetStarted}
              className="w-full py-4 rounded-xl font-semibold"
              data-testid="button-getstarted"
            >
              Get Started
            </Button>
            
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Badge variant="outline" className="border-secondary text-secondary">
                <Shield className="w-4 h-4 mr-1" />
                Verified students only
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
