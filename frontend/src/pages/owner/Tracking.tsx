import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Circle, MapPin, Phone, User, AlertTriangle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import fleetImage from '../../assets/fleet-delivery-trucks.png';

export const Tracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { shipments } = useStore();
  const shipment = shipments.find(s => s.id === id);
  const driver = useStore(state => state.drivers.find(d => d.id === shipment?.driverId));

  if (!shipment) return <div>Shipment not found</div>;

  const steps = [
    { key: 'pending', label: 'Order Placed' },
    { key: 'assigned', label: 'Driver Assigned' },
    { key: 'picked_up', label: 'Picked Up' },
    { key: 'in_transit', label: 'In Transit' },
    { key: 'delivered', label: 'Delivered' }
  ];

  const currentStepIndex = steps.findIndex(s => s.key === shipment.status);

  // Parse origin and destination for display
  const [pickupAddress, pickupCity] = shipment.origin.split(', ').filter(Boolean);
  const [deliveryAddress, deliveryCity] = shipment.destination.split(', ').filter(Boolean);

  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div className="absolute inset-0 w-screen h-screen opacity-10 pointer-events-none z-0 overflow-hidden">
        <img src={fleetImage} alt="Fleet Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-navy-900 opacity-50"></div>
      </div>

      {/* Existing Content */}
      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2 justify-start sm:justify-center">
            <ArrowLeft size={20} />
            <span className="sm:inline">Back to Shipments</span>
          </Button>
          <div className="flex items-center gap-2 px-4 sm:px-0">
            <Badge variant={shipment.status === 'delivered' ? 'default' : 'secondary'} className={shipment.status === 'delivered' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs sm:text-sm py-1 px-3' : 'bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs sm:text-sm py-1 px-3'}>
              {shipment.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        {shipment.incidentNote && (
          <Card className="bg-amber-50 border-amber-200 shadow-lg border-l-4 border-l-amber-500 overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="text-amber-600" size={20} />
                </div>
                <div>
                  <h3 className="text-amber-900 font-bold flex items-center gap-2">
                    Active Incident / Delay Reported
                    <span className="text-[10px] bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Important</span>
                  </h3>
                  <p className="text-amber-800/80 text-sm mt-1 leading-relaxed">
                    {shipment.incidentNote}
                  </p>
                  <p className="text-amber-700/60 text-[10px] mt-2 font-medium">
                    Reported by driver on {new Date(shipment.statusHistory.filter(h => h.note?.startsWith('INCIDENT:')).pop()?.timestamp || '').toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="border-b border-slate-100 flex items-center justify-between bg-linear-to-r from-[hsl(var(--gradient-from))] to-[hsl(var(--gradient-to))] text-white rounded-t-2xl">
                <div>
                  <CardTitle className="text-xl text-foreground">Status Timeline</CardTitle>
                  <CardDescription className="text-white/90 text-sm">Tracking ID: {shipment.trackingId}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="relative">
                  {/* Connecting Line */}
                  <div className="absolute left-6 sm:left-8 top-8 bottom-8 w-0.5 bg-slate-200"></div>
                  <div className="space-y-6 sm:space-y-8">
                    {steps.map((step, index) => {
                      const isCompleted = index <= currentStepIndex;
                      const isCurrent = index === currentStepIndex;
                      const historyItem = shipment.statusHistory.find(h => h.status === step.key);

                      return (
                        <div key={step.key} className="relative z-10 flex items-start gap-4 sm:gap-6">
                          <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center border-2 sm:border-4 shrink-0 transition-colors ${isCompleted ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-slate-200 text-slate-300'}`}>
                            {isCompleted ? <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8" /> : <Circle className="w-6 h-6 sm:w-8 sm:h-8" />}
                          </div>
                          <div className="pt-2 sm:pt-4">
                            <h3 className={`font-bold text-base sm:text-lg ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                              {step.label}
                            </h3>
                            {historyItem && (
                              <div className="mt-1">
                                <p className="text-xs sm:text-sm text-slate-500">
                                  {new Date(historyItem.timestamp).toLocaleString()}
                                </p>
                                <p className="text-sm text-slate-600 mt-1">{historyItem.note}</p>
                              </div>
                            )}
                            {isCurrent && (
                              <Badge variant="secondary" className="mt-2 text-[10px] sm:text-xs bg-blue-100 text-blue-700 hover:bg-blue-100 animate-pulse">
                                Current Status
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Contact Information Card */}
            <Card>
              <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Pickup Contact */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Pickup Contact</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{pickupAddress}</p>
                        <p className="text-sm text-muted-foreground">{pickupCity}</p>
                      </div>
                    </div>
                    {shipment.pickupContactPerson && (
                      <div className="flex items-start gap-2">
                        <User size={16} className="text-slate-400 mt-0.5 shrink-0" />
                        <p className="text-sm text-foreground">{shipment.pickupContactPerson}</p>
                      </div>
                    )}
                    {shipment.pickupContactPhone && (
                      <div className="flex items-start gap-2">
                        <Phone size={16} className="text-slate-400 mt-0.5 shrink-0" />
                        <p className="text-sm text-foreground">{shipment.pickupContactPhone}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delivery Contact */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Delivery Contact</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{deliveryAddress}</p>
                        <p className="text-sm text-muted-foreground">{deliveryCity}</p>
                      </div>
                    </div>
                    {shipment.deliveryContactPerson && (
                      <div className="flex items-start gap-2">
                        <User size={16} className="text-slate-400 mt-0.5 shrink-0" />
                        <p className="text-sm text-foreground">{shipment.deliveryContactPerson}</p>
                      </div>
                    )}
                    {shipment.deliveryContactPhone && (
                      <div className="flex items-start gap-2">
                        <Phone size={16} className="text-slate-400 mt-0.5 shrink-0" />
                        <p className="text-sm text-foreground">{shipment.deliveryContactPhone}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {driver ? (
              <Card>
                <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                  <CardTitle>Assigned Transporter</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-xl font-bold text-blue-600 shadow-sm">
                      {driver.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{driver.name}</h4>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${driver.status === 'available' ? 'bg-emerald-500' : driver.status === 'busy' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                        <span className="text-xs font-semibold text-muted-foreground capitalize">{driver.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Current Location</p>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Circle className="fill-blue-500 text-blue-500" size={10} />
                        <span className="text-sm font-bold">{driver.currentLocation || 'Awaiting Update'}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Card className="p-3 bg-slate-50">
                        <CardContent className="p-0">
                          <CardDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Vehicle</CardDescription>
                          <p className="text-xs font-bold text-foreground">{driver.vehicleType}</p>
                        </CardContent>
                      </Card>
                      <Card className="p-3 bg-slate-50">
                        <CardContent className="p-0">
                          <CardDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Plate</CardDescription>
                          <p className="text-xs font-bold font-mono text-foreground">{driver.vehiclePlate}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  <Button className="w-full mt-6">
                    Contact Transporter
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-blue-50 border border-blue-100">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-blue-700 font-medium italic">
                    Transporter assignment is pending. We'll update you as soon as a driver confirms.
                  </p>
                </CardContent>
              </Card>
            )}

            <Card className="bg-slate-900 text-white">
              <CardHeader className="p-6">
                <CardTitle className="text-white mb-2">Need Support?</CardTitle>
                <CardDescription className="text-slate-400 text-xs mb-4">
                  Our broker team is available 24/7 for critical shipment assistance.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <Button variant="secondary" className="w-full bg-white/10 hover:bg-white/20 text-white">
                  Request Help
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
