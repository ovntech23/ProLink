import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import type { DriverProfile } from '../../store/useStore';
import { Phone, MapPin, Truck, Plus, X, Save } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FilterSection } from "@/components/layout/FilterSection";
import fleetImage from '../../assets/fleet-delivery-trucks.png';

export const DriversList = () => {
  const navigate = useNavigate();
  const { drivers, addDriver } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDriver, setNewDriver] = useState<Partial<DriverProfile>>({
    name: '',
    email: '',
    phone: '',
    vehicleType: '',
    vehiclePlate: '',
    vehicleModel: '',
    vehicleCategory: '',
    trailerPlate: '',
    currentLocation: ''
  });

  // Filter states
  const [locationFilter, setLocationFilter] = useState('all');
  const [vehicleCategoryFilter, setVehicleCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Get unique locations and vehicle categories for filter options
  const uniqueLocations = useMemo(() => {
    const locations = drivers.map(driver => driver.currentLocation).filter(Boolean) as string[];
    return Array.from(new Set(locations)).filter(location => location !== '').sort();
  }, [drivers]);

  const uniqueVehicleCategories = useMemo(() => {
    const categories = drivers.map(driver => driver.vehicleCategory).filter(Boolean) as string[];
    return Array.from(new Set(categories)).filter(category => category !== '').sort();
  }, [drivers]);

  // Filter drivers based on applied filters
  const filteredDrivers = useMemo(() => {
    return drivers.filter(driver => {
      // Search query filter (name, email, vehicle type)
      const matchesSearch = !searchQuery ||
        driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.vehicleType.toLowerCase().includes(searchQuery.toLowerCase());

      // Location filter
      const matchesLocation = !locationFilter || locationFilter === 'all' ||
        (driver.currentLocation && driver.currentLocation.toLowerCase().includes(locationFilter.toLowerCase()));

      // Vehicle category filter
      const matchesCategory = !vehicleCategoryFilter || vehicleCategoryFilter === 'all' ||
        (driver.vehicleCategory && driver.vehicleCategory === vehicleCategoryFilter);

      return matchesSearch && matchesLocation && matchesCategory;
    });
  }, [drivers, searchQuery, locationFilter, vehicleCategoryFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newDriver.name && newDriver.email) {
      try {
        await addDriver(newDriver as any);
        setShowAddModal(false);
        setNewDriver({
          name: '',
          email: '',
          phone: '',
          vehicleType: '',
          vehiclePlate: '',
          vehicleModel: '',
          vehicleCategory: '',
          trailerPlate: '',
          currentLocation: ''
        });
      } catch (error) {
        console.error('Failed to create driver:', error);
      }
    }
  };

  const clearFilters = () => {
    setLocationFilter('all');
    setVehicleCategoryFilter('all');
    setSearchQuery('');
  };

  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div className="absolute inset-0 w-screen h-screen opacity-15 pointer-events-none z-0 overflow-hidden">
        <img src={fleetImage} alt="Fleet Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-navy-900 opacity-50"></div>
      </div>

      {/* Existing Content */}
      <div className="relative z-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#ba0b0b]">Transporters</h2>
            <p className="text-muted-foreground text-sm sm:base">View and manage fleet drivers</p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="w-full sm:w-auto">
            <Plus size={20} /> New Driver
          </Button>
        </div>

        {/* Filter Section */}
        <FilterSection
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          locationFilter={locationFilter}
          onLocationFilterChange={setLocationFilter}
          vehicleCategoryFilter={vehicleCategoryFilter}
          onVehicleCategoryFilterChange={setVehicleCategoryFilter}
          uniqueLocations={uniqueLocations}
          uniqueVehicleCategories={uniqueVehicleCategories}
          onClearFilters={clearFilters}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrivers.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">
                {drivers.length === 0
                  ? "No transporters found."
                  : "No transporters match the current filters."}
              </p>
              {drivers.length > 0 && (
                <Button variant="outline" onClick={clearFilters} className="mt-4">
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            filteredDrivers.map((driver) => (
              <div key={driver.id} className="bg-card p-6 rounded-xl shadow-sm border border-border">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-slate-600 overflow-hidden bg-white">
                      {driver.avatar ? (
                        <img src={driver.avatar} alt={driver.name} className="w-full h-full object-cover" />
                      ) : (
                        driver.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{driver.name}</h3>
                      <p className="text-xs text-muted-foreground">{driver.email}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${driver.status === 'available'
                      ? 'bg-emerald-100 text-emerald-700'
                      : driver.status === 'busy'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                    {driver.status}
                  </span>
                </div>
                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex items-center gap-3 text-sm text-foreground">
                    <Truck size={16} className="text-slate-400" />
                    <span>{driver.vehicleType} • {driver.vehiclePlate}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-foreground">
                    <MapPin size={16} className="text-slate-400" />
                    <span>{driver.currentLocation || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-foreground">
                    <Phone size={16} className="text-slate-400" />
                    <span>{driver.phone || '+260 00 000 0000'}</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-6" onClick={() => navigate(`/broker/drivers/${driver.id}`)}>
                  View Profile
                </Button>
              </div>
            ))
          )}
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in transition-all">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-8 relative shadow-2xl overflow-y-auto max-h-[90vh]">
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-all"
              >
                <X size={20} />
              </button>

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-[#ba0b0b] mb-1">Add New Transporter</h3>
                <p className="text-muted-foreground text-sm">Create a manual profile for a driver. They can be pre-approved instantly.</p>
              </div>

              <form onSubmit={handleCreate} className="space-y-8">
                {/* Personal & Contact Info */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-[#ba0b0b] font-bold text-xs uppercase tracking-widest px-1">
                    <span className="w-6 h-px bg-[#ba0b0b]/30"></span>
                    Personal Information
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="driver-name" className="text-[10px] font-bold text-slate-600 uppercase ml-1">Full Name</Label>
                      <Input
                        required
                        id="driver-name"
                        name="name"
                        className="rounded-xl border-slate-200 focus:ring-[#ba0b0b]/20 focus:border-[#ba0b0b] h-12"
                        value={newDriver.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDriver({ ...newDriver, name: e.target.value })}
                        placeholder="John Doe"
                        autoComplete="name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="driver-email" className="text-[10px] font-bold text-slate-600 uppercase ml-1">Email / ID</Label>
                      <Input
                        type="email"
                        required
                        id="driver-email"
                        name="email"
                        className="rounded-xl border-slate-200 focus:ring-[#ba0b0b]/20 focus:border-[#ba0b0b] h-12"
                        value={newDriver.email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDriver({ ...newDriver, email: e.target.value })}
                        placeholder="john@prolink.com"
                        autoComplete="email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="driver-phone" className="text-[10px] font-bold text-slate-600 uppercase ml-1">Phone Number</Label>
                      <Input
                        id="driver-phone"
                        name="phone"
                        className="rounded-xl border-slate-200 focus:ring-[#ba0b0b]/20 focus:border-[#ba0b0b] h-12"
                        value={newDriver.phone}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDriver({ ...newDriver, phone: e.target.value })}
                        placeholder="+260 9x xxxx xxx"
                        autoComplete="tel"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="driver-location" className="text-[10px] font-bold text-slate-600 uppercase ml-1">Initial Location</Label>
                      <Input
                        id="driver-location"
                        name="currentLocation"
                        className="rounded-xl border-slate-200 focus:ring-[#ba0b0b]/20 focus:border-[#ba0b0b] h-12"
                        value={newDriver.currentLocation}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDriver({ ...newDriver, currentLocation: e.target.value })}
                        placeholder="e.g. Lusaka Hub"
                        autoComplete="address-level2"
                      />
                    </div>
                  </div>
                </section>

                {/* Vehicle Specifications */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-[#ba0b0b] font-bold text-xs uppercase tracking-widest px-1">
                    <span className="w-6 h-px bg-[#ba0b0b]/30"></span>
                    Vehicle Specifications
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="vehicle-model" className="text-[10px] font-bold text-slate-600 uppercase ml-1">Make / Model</Label>
                      <Input
                        id="vehicle-model"
                        name="vehicleModel"
                        className="rounded-xl border-slate-200 focus:ring-[#ba0b0b]/20 focus:border-[#ba0b0b] h-12"
                        value={newDriver.vehicleModel}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDriver({ ...newDriver, vehicleModel: e.target.value })}
                        placeholder="e.g. Volvo FH16"
                        autoComplete="organization"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vehicle-type" className="text-[10px] font-bold text-slate-600 uppercase ml-1">Vehicle Type</Label>
                      <Input
                        required
                        id="vehicle-type"
                        name="vehicleType"
                        className="rounded-xl border-slate-200 focus:ring-[#ba0b0b]/20 focus:border-[#ba0b0b] h-12"
                        value={newDriver.vehicleType}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDriver({ ...newDriver, vehicleType: e.target.value })}
                        placeholder="e.g. Semi-Truck"
                        autoComplete="organization"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vehicle-plate" className="text-[10px] font-bold text-slate-600 uppercase ml-1">Registration Plate</Label>
                      <Input
                        required
                        id="vehicle-plate"
                        name="vehiclePlate"
                        className="rounded-xl border-slate-200 focus:ring-[#ba0b0b]/20 focus:border-[#ba0b0b] font-mono h-12 uppercase"
                        value={newDriver.vehiclePlate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDriver({ ...newDriver, vehiclePlate: e.target.value })}
                        placeholder="ABC-1234"
                        autoComplete="off"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="trailer-plate" className="text-[10px] font-bold text-slate-600 uppercase ml-1">Trailer Plate (Optional)</Label>
                      <Input
                        id="trailer-plate"
                        name="trailerPlate"
                        className="rounded-xl border-slate-200 focus:ring-[#ba0b0b]/20 focus:border-[#ba0b0b] font-mono h-12 uppercase"
                        value={newDriver.trailerPlate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDriver({ ...newDriver, trailerPlate: e.target.value })}
                        placeholder="TRL-9988"
                        autoComplete="off"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                      <Label htmlFor="vehicle-category" className="text-[10px] font-bold text-slate-600 uppercase ml-1">Vehicle Category</Label>
                      <select
                        id="vehicle-category"
                        name="vehicleCategory"
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#ba0b0b]/20 focus:border-[#ba0b0b] outline-none bg-white font-medium text-slate-900 appearance-none cursor-pointer transition-all"
                        value={newDriver.vehicleCategory}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewDriver({ ...newDriver, vehicleCategory: e.target.value })}
                      >
                        <option value="">Select Category...</option>
                        {[
                          'Delivery Van',
                          'Bus',
                          'Truck with Flatbed',
                          'Tanker',
                          'Box Truck',
                          'Refrigerated Truck',
                          'Curtain Sider',
                          'Car Carrier',
                          'Tipper Truck'
                        ].map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </section>

                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full sm:w-auto h-12 px-8 rounded-xl hover:bg-slate-50 font-bold text-slate-600"
                    onClick={() => setShowAddModal(false)}
                  >
                    Discard Changes
                  </Button>
                  <Button
                    type="submit"
                    className="w-full sm:flex-1 h-12 rounded-xl bg-[#ba0b0b] hover:bg-[#940909] shadow-lg shadow-[#ba0b0b]/20 flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    Onboard Transporter
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
