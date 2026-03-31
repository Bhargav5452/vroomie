import { Card, CardContent } from "@/components/ui/card";
import { Leaf } from "lucide-react";

interface CarbonBadgeProps {
  carbonSaved: number;
}

export default function CarbonBadge({ carbonSaved }: CarbonBadgeProps) {
  return (
    <Card className="bg-gradient-to-r from-secondary to-green-600 text-white border-0">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Leaf className="text-2xl" />
          </div>
          <div>
            <p className="font-semibold">Carbon Saver Badge</p>
            <p className="text-sm opacity-90" data-testid="text-carbon-saved">
              This ride saves {carbonSaved} kg CO₂
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
