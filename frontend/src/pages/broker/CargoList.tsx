import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Truck, UserCircle, ChevronDown } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Button } from "@/components/ui/button";
import fleetImage from '../../assets/fleet-delivery-trucks.png';

export const CargoList = () => {
  const navigate = useNavigate();
  const { shipments, drivers, assignDriver } = useStore();
  const [assigningId, setAssigningId] = useState<string | null>(null);

  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div className="absolute inset-0 w-screen h-screen opacity-10 pointer-events-none z-0 overflow-hidden">
        <img src={fleetImage} alt="Fleet Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-navy-900 opacity-50"></div>
      </div>

      {/* Existing Content */}
      <div className="relative z-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#950606]">Cargo Management</h2>
            <p className="text-muted-foreground text-sm sm:base">Manage and track all shipments</p>
          </div>
          <Button onClick={() => navigate('/owner/book')} className="w-full sm:w-auto">
            <Plus size={20} />
            New Shipment
          </Button>
        </div>

        <div className="grid gap-4">
          {shipments.map((shipment) => (
            <div key={shipment.id} className="bg-card p-6 rounded-xl shadow-sm border border-border hover:border-primary/20 transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {shipment.trackingId}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full uppercase ${shipment.status === 'delivered'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                      }`}>
                      {shipment.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-slate-400" />
                      <span className="font-medium text-sm sm:text-base">{shipment.origin}</span>
                    </div>
                    <div className="hidden sm:block h-px w-8 bg-slate-300"></div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-slate-400" />
                      <span className="font-medium text-sm sm:text-base">{shipment.destination}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6 min-w-50">
                  <div className="text-right mr-4 flex-1">
                    <p className="text-sm font-medium text-foreground">{shipment.cargoType}</p>
                    <p className="text-xs text-muted-foreground">{shipment.weight}</p>
                  </div>
                  {shipment.status === 'pending' ? (
                    <div className="relative">
                      <Button
                        variant="outline"
                        onClick={() => setAssigningId(assigningId === shipment.id ? null : shipment.id)}
                      >
                        <UserCircle size={16} />
                        Assign Driver
                        <ChevronDown size={14} className={assigningId === shipment.id ? 'rotate-180 transition-transform' : 'transition-transform'} />
                      </Button>
                      {assigningId === shipment.id && (
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 z-50 py-2">
                          <p className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Available Drivers</p>
                          {drivers.filter(d => !d.status || d.status === 'available').map(driver => (
                            <Button
                              key={driver.id}
                              variant="ghost"
                              className="w-full px-4 py-2 flex items-center justify-between hover:bg-blue-50 group transition-colors text-left"
                              onClick={async () => {
                                try {
                                  await assignDriver(shipment.id, driver.id);
                                  setAssigningId(null);
                                } catch (error) {
                                  console.error('Failed to assign driver:', error);
                                }
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600">
                                  {driver.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-slate-900">{driver.name}</p>
                                  <p className="text-xs text-slate-500">{driver.vehicleType}</p>
                                </div>
                              </div>
                            </Button>
                          ))}
                          {drivers.filter(d => !d.status || d.status === 'available').length === 0 && (
                            <p className="px-4 py-3 text-sm text-slate-500 italic">No available drivers</p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : shipment.driverId ? (
                    <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <Truck size={16} className="text-blue-500" />
                      <div className="text-left">
                        <p className="text-xs text-slate-500 leading-none mb-0.5 font-semibold">Assigned Driver</p>
                        <p className="text-sm font-medium leading-none">{drivers.find(d => d.id === shipment.driverId)?.name}</p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic capitalize">{shipment.status.replace('_', ' ')}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
