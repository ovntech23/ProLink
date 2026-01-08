import { useState, useRef } from 'react';
import { useStore } from '../../store/useStore';
import type { DriverProfile } from '../../store/useStore';
import { Truck, MapPin, Save, CheckCircle, Camera } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Profile = () => {
  const { currentUser, updateDriverProfile } = useStore();
  const driver = currentUser as DriverProfile;
  const [status, setStatus] = useState<DriverProfile['status']>(driver?.status || 'available');
  const [location, setLocation] = useState(driver?.currentLocation || '');
  const [locationComment, setLocationComment] = useState('');
  const [trailerPlate, setTrailerPlate] = useState(driver?.trailerPlate || '');
  const [vehicleCategory, setVehicleCategory] = useState(driver?.vehicleCategory || '');
  const [vehicleType, setVehicleType] = useState(driver?.vehicleType || '');
  const [vehiclePlate, setVehiclePlate] = useState(driver?.vehiclePlate || '');
  const [vehicleModel, setVehicleModel] = useState(driver?.vehicleModel || '');
  const [avatarPreview, setAvatarPreview] = useState(driver?.avatar || '');
  const [vehiclePreview, setVehiclePreview] = useState(driver?.vehicleImage || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const vehicleInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'vehicle') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'avatar') setAvatarPreview(reader.result as string);
        else setVehiclePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!driver) return;
    setIsSaving(true);
    updateDriverProfile(driver.id, {
      status,
      currentLocation: location,
      trailerPlate,
      vehicleCategory,
      vehicleType,
      vehiclePlate,
      vehicleModel,
      avatar: avatarPreview,
      vehicleImage: vehiclePreview
    }, locationComment);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setLocationComment(''); // Clear comment after save
      setTimeout(() => setShowSuccess(false), 3000);
    }, 800);
  };

  if (!driver) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <div className="relative group p-4 sm:p-0">
          <input
            type="file"
            ref={vehicleInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'vehicle')}
          />
          <div className="h-40 sm:h-48 w-full bg-slate-900 rounded-t-xl overflow-hidden relative group">
            {vehiclePreview ? (
              <img src={vehiclePreview} alt="Vehicle Cover" className="w-full h-full object-cover opacity-60 group-hover:opacity-50 transition-opacity" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-slate-900 to-slate-800 flex items-center justify-center">
                <Truck size={48} className="text-white/10" />
              </div>
            )}
            <Button
              variant="secondary"
              size="sm"
              className="absolute bottom-4 right-4 bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => vehicleInputRef.current?.click()}
            >
              <Camera size={16} className="mr-2" />
              Edit Cover
            </Button>
          </div>
          <div className="px-6 sm:px-8 pb-8">
            <div className="relative -mt-16 sm:-mt-20 mb-6 group/avatar w-fit">
              <input
                type="file"
                ref={avatarInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'avatar')}
              />
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-4xl font-bold text-slate-600 shadow-xl overflow-hidden relative group/btn">
                {avatarPreview ? (
                  <img src={avatarPreview} alt={driver.name} className="w-full h-full object-cover" />
                ) : (
                  driver.name.charAt(0)
                )}
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity"
                >
                  <Camera size={24} className="text-white" />
                </button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground leading-tight">{driver.name}</h1>
                <p className="text-muted-foreground font-medium">{driver.email}</p>
              </div>
              <div className="flex items-center gap-3">
                {showSuccess && (
                  <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium animate-in fade-in slide-in-from-right-4">
                    <CheckCircle size={16} /> Saved successfully
                  </span>
                )}
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save size={18} className="mr-2" />
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Truck size={18} />
                    </div>
                    Availability Status
                  </CardTitle>
                </CardHeader>
                <div className="flex flex-col gap-3">
                  {(['available', 'busy', 'offline'] as const).map((s) => (
                    <Button
                      key={s}
                      variant={status === s ? "default" : "outline"}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all group ${status === s ? 'border-blue-600 bg-blue-50/50 shadow-sm' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}
                      onClick={() => setStatus(s)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${s === 'available' ? 'bg-emerald-500' : s === 'busy' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                        <span className={`font-semibold capitalize ${status === s ? 'text-blue-900' : 'text-slate-600'}`}>
                          {s}
                        </span>
                      </div>
                      {status === s && (
                        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                      <MapPin size={18} />
                    </div>
                    Current Location
                  </CardTitle>
                </CardHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="driver-location" className="block text-sm font-bold text-muted-foreground mb-2 px-1">STREET / AREA / CITY</Label>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                      <Input
                        id="driver-location"
                        name="location"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl outline-none transition-all font-medium text-slate-900 placeholder:text-slate-300 shadow-inner"
                        placeholder="Enter your current location..."
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        autoComplete="address-level2"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="location-comment" className="block text-sm font-bold text-muted-foreground mb-2 px-1 text-[10px] uppercase">Special Comment (Visible on Tracking)</Label>
                    <Input
                      id="location-comment"
                      name="locationComment"
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-xl outline-none transition-all font-medium text-slate-900 placeholder:text-slate-300"
                      placeholder="e.g. Heavy traffic, rain, or pitstop..."
                      value={locationComment}
                      onChange={(e) => setLocationComment(e.target.value)}
                    />
                  </div>
                  <Card className="p-4 bg-amber-50 border border-amber-100">
                    <CardContent className="p-0">
                      <p className="text-xs text-amber-800 font-medium">
                        <strong>Note:</strong> Updating your location helps brokers find you more efficiently for nearby shipments.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-border">
              <CardHeader className="p-0 mb-6">
                <CardTitle>Vehicle Specification</CardTitle>
              </CardHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="p-4 bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                  <CardContent className="p-0">
                    <Label htmlFor="vehicle-model" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 cursor-pointer">Make / Model</Label>
                    <input
                      id="vehicle-model"
                      name="vehicleModel"
                      className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold text-foreground placeholder:text-slate-300 outline-none"
                      placeholder="e.g. Volvo FH16"
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      autoComplete="organization"
                    />
                  </CardContent>
                </Card>
                <Card className="p-4 bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                  <CardContent className="p-0">
                    <Label htmlFor="vehicle-type" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 cursor-pointer">Vehicle Type</Label>
                    <input
                      id="vehicle-type"
                      name="vehicleType"
                      className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold text-foreground placeholder:text-slate-300 outline-none"
                      placeholder="e.g. Semi-Truck"
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      autoComplete="organization"
                    />
                  </CardContent>
                </Card>
                <Card className="p-4 bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                  <CardContent className="p-0">
                    <Label htmlFor="vehicle-plate" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 cursor-pointer">Number Plate</Label>
                    <input
                      id="vehicle-plate"
                      name="vehiclePlate"
                      className="w-full bg-transparent border-none p-0 focus:ring-0 font-mono font-bold text-foreground placeholder:text-slate-300 outline-none uppercase"
                      placeholder="ABC-1234"
                      value={vehiclePlate}
                      onChange={(e) => setVehiclePlate(e.target.value)}
                      autoComplete="off"
                    />
                  </CardContent>
                </Card>
                <Card className="p-4 bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                  <CardContent className="p-0">
                    <Label htmlFor="trailer-plate" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 cursor-pointer">Trailer Plate</Label>
                    <input
                      id="trailer-plate"
                      name="trailerPlate"
                      className="w-full bg-transparent border-none p-0 focus:ring-0 font-mono font-bold text-foreground placeholder:text-slate-300 outline-none uppercase"
                      placeholder="TRL-5678"
                      value={trailerPlate}
                      onChange={(e) => setTrailerPlate(e.target.value)}
                      autoComplete="off"
                    />
                  </CardContent>
                </Card>
                <Card className="p-4 bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors lg:col-span-2">
                  <CardContent className="p-0">
                    <Label htmlFor="vehicle-category" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 cursor-pointer">Vehicle Category</Label>
                    <select
                      id="vehicle-category"
                      name="vehicleCategory"
                      className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold text-foreground outline-none cursor-pointer appearance-none"
                      value={vehicleCategory}
                      onChange={(e) => setVehicleCategory(e.target.value)}
                    >
                      <option value="">Select Category...</option>
                      {[
                        'Delivery Van', 'Bus', 'Truck with Flatbed', 'Tanker',
                        'Box Truck', 'Refrigerated Truck', 'Curtain Sider',
                        'Car Carrier', 'Tipper Truck'
                      ].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </CardContent>
                </Card>
              </div>

            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
