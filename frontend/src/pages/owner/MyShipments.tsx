import { Package, ArrowRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect } from 'react';
import fleetImage from '../../assets/fleet-delivery-trucks.png';

export const MyShipments = () => {
  const { shipments, currentUser, initRealTimeUpdates } = useStore();
  const navigate = useNavigate();
  const myShipments = shipments.filter(s => s.ownerId === currentUser?.id);

  // Initialize real-time updates when component mounts
  useEffect(() => {
    initRealTimeUpdates();
  }, [initRealTimeUpdates]);

  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div className="absolute inset-0 w-screen h-screen opacity-10 pointer-events-none z-0 overflow-hidden">
        <img src={fleetImage} alt="Fleet Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-navy-900 opacity-50"></div>
      </div>

      {/* Existing Content */}
      <div className="relative z-10 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-[#950606]">My Shipments</h2>
          <p className="text-muted-foreground">Track and manage your active orders</p>
        </div>
        <div className="grid gap-4">
          {myShipments.map((shipment) => (
            <Card key={shipment.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <Package size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{shipment.trackingId}</p>
                        <p className="text-xs text-muted-foreground">Created: {new Date(shipment.pickupDate).toLocaleDateString()}</p>
                      </div>
                      <Badge variant={shipment.status === 'delivered' ? 'default' : shipment.status === 'pending' ? 'secondary' : 'outline'} className={shipment.status === 'delivered' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : shipment.status === 'pending' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100' : 'bg-blue-100 text-blue-700 hover:bg-blue-100'}>
                        {shipment.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-4 text-sm text-foreground">
                      <span className="font-medium">{shipment.origin}</span>
                      <ArrowRight size={14} className="text-slate-400" />
                      <span className="font-medium">{shipment.destination}</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-50">
                    <Button onClick={() => navigate(`/owner/tracking/${shipment.id}`)} size="sm">
                      Track Status
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {myShipments.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="text-center py-12">
                <Package size={48} className="mx-auto text-slate-300 mb-3" />
                <CardTitle className="text-lg">No shipments found</CardTitle>
                <CardDescription>Contact ProLink to book a shipment</CardDescription>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
