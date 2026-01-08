import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Truck, MapPin, Package, CheckCircle, Clock, AlertCircle, ArrowLeft, Save, Edit2, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from 'react';
import type { DriverProfile as DriverProfileType } from '../../store/useStore';

export const DriverProfile = () => {
  const { driverId } = useParams();
  const navigate = useNavigate();
  const { drivers, shipments, updateDriverProfile } = useStore();

  const driver = drivers.find(d => d.id === driverId) as DriverProfileType;
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [locationValue, setLocationValue] = useState(driver?.currentLocation || '');
  const [locationCommentValue, setLocationCommentValue] = useState('');

  const handleLocationUpdate = () => {
    if (!driver) return;
    updateDriverProfile(driver.id, { currentLocation: locationValue }, locationCommentValue);
    setIsEditingLocation(false);
    setLocationCommentValue('');
  };

  if (!driver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Driver Not Found</h2>
        <p className="text-muted-foreground mb-6">The requested driver profile could not be found.</p>
        <Button onClick={() => navigate('/broker/drivers')}>
          Back to Transporters
        </Button>
      </div>
    );
  }

  // Calculate driver statistics
  const driverShipments = shipments.filter(s => s.driverId === driver.id);
  const completedShipments = driverShipments.filter(s => s.status === 'delivered');
  const inProgressShipments = driverShipments.filter(s =>
    s.status === 'assigned' || s.status === 'picked_up' || s.status === 'in_transit'
  );

  const totalDeliveries = completedShipments.length;
  const successRate = driverShipments.length > 0
    ? Math.round((completedShipments.length / driverShipments.length) * 100)
    : 0;

  // Get unique destinations
  const destinations = [...new Set(completedShipments.map(s => s.destination))];

  // Recent deliveries (last 5)
  const recentDeliveries = completedShipments
    .sort((a, b) => new Date(b.pickupDate).getTime() - new Date(a.pickupDate).getTime())
    .slice(0, 5);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => navigate('/broker/drivers')}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Transporters
        </Button>
      </div>

      <Card className="overflow-hidden border-none shadow-xl">
        <div className="h-48 relative overflow-hidden">
          {driver.vehicleImage ? (
            <img src={driver.vehicleImage} alt="Vehicle" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-linear-to-r from-blue-600 to-[#950606]" />
          )}
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="px-8 pb-8">
          <div className="relative -mt-16 mb-6">
            <div className="w-32 h-32 rounded-full border-4 border-white flex items-center justify-center text-4xl font-bold text-slate-600 shadow-md overflow-hidden bg-white">
              {driver.avatar ? (
                <img src={driver.avatar} alt={driver.name} className="w-full h-full object-cover" />
              ) : (
                driver.name.charAt(0)
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground leading-tight">{driver.name}</h1>
              <div className="flex flex-col gap-1 mt-1">
                <p className="text-muted-foreground font-medium">{driver.email}</p>
                {driver.phone && (
                  <p className="text-sm text-slate-500 font-medium">{driver.phone}</p>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${driver.status === 'available'
                  ? 'bg-emerald-100 text-emerald-700'
                  : driver.status === 'busy'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-slate-100 text-slate-600'
                  }`}>
                  {driver.status}
                </span>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4">
              <CardContent className="p-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Package size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Deliveries</p>
                    <p className="text-2xl font-bold text-foreground">{totalDeliveries}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-4">
              <CardContent className="p-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold text-foreground">{successRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-4">
              <CardContent className="p-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold text-foreground">{inProgressShipments.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-4">
              <CardContent className="p-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Destinations</p>
                    <p className="text-2xl font-bold text-foreground">{destinations.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Vehicle Information */}
            <div>
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Truck size={18} />
                  </div>
                  Vehicle Information
                </CardTitle>
              </CardHeader>
              <Card className="p-6 h-full">
                <CardContent className="p-0">
                  <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Make / Model</p>
                      <p className="font-bold text-foreground">{driver.vehicleModel || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Vehicle Type</p>
                      <p className="font-bold text-foreground">{driver.vehicleType}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Plate Number</p>
                      <p className="font-mono font-bold text-foreground">{driver.vehiclePlate}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Trailer Plate</p>
                      <p className="font-mono font-bold text-foreground">{driver.trailerPlate || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Vehicle Category</p>
                      <p className="font-bold text-foreground">{driver.vehicleCategory || 'Not categorized'}</p>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center justify-between mb-1">
                        <Label htmlFor="location-override" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider cursor-pointer">Current Location</Label>
                        <button
                          onClick={() => setIsEditingLocation(!isEditingLocation)}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          {isEditingLocation ? <><X size={10} /> Cancel</> : <><Edit2 size={10} /> Override</>}
                        </button>
                      </div>
                      {isEditingLocation ? (
                        <div className="flex flex-col gap-2">
                          <Input
                            id="location-override"
                            name="location"
                            className="h-8 text-xs bg-white"
                            value={locationValue}
                            onChange={(e) => setLocationValue(e.target.value)}
                            placeholder="Enter new location..."
                            autoFocus
                            autoComplete="address-level2"
                          />
                          <Label htmlFor="location-comment-override" className="sr-only">Location Comment</Label>
                          <Input
                            id="location-comment-override"
                            name="locationComment"
                            className="h-8 text-xs bg-white"
                            value={locationCommentValue}
                            onChange={(e) => setLocationCommentValue(e.target.value)}
                            placeholder="Special comment (optional)..."
                          />
                          <Button
                            size="sm"
                            className="h-8 w-full bg-emerald-600 hover:bg-emerald-700"
                            onClick={handleLocationUpdate}
                          >
                            <Save size={14} className="mr-2" /> Save Update
                          </Button>
                        </div>
                      ) : (
                        <p className="font-bold text-foreground">
                          {driver.currentLocation || 'Not specified'}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Destinations Served */}
            <div>
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                    <MapPin size={18} />
                  </div>
                  Destinations Served
                </CardTitle>
              </CardHeader>
              <Card className="p-6">
                <CardContent className="p-0">
                  {destinations.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {destinations.map((destination, index) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1">
                          {destination}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No destinations served yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Deliveries */}
          <div className="mt-8">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-lg">Recent Deliveries</CardTitle>
              <CardDescription>Latest successfully completed shipments</CardDescription>
            </CardHeader>
            <Card>
              <CardContent className="p-0">
                {recentDeliveries.length > 0 ? (
                  <div className="divide-y divide-border">
                    {recentDeliveries.map((shipment) => (
                      <div key={shipment.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-sm font-medium text-blue-600">
                                {shipment.trackingId}
                              </span>
                              <Badge variant="default" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                                Delivered
                              </Badge>
                            </div>
                            <p className="text-sm text-foreground">
                              <span className="font-medium">{shipment.origin}</span> → <span className="font-medium">{shipment.destination}</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {shipment.cargoType} • {shipment.weight}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              {new Date(shipment.pickupDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Package size={32} className="mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No deliveries completed yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );
};
