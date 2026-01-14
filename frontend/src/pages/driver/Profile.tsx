import { useState, useRef } from 'react';
import { useStore } from '../../store/useStore';
import type { DriverProfile } from '../../store/useStore';
import { Truck, MapPin, Save, Camera, User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';

export const Profile = () => {
  const { currentUser, updateProfile, changePassword } = useStore();
  const isDriver = currentUser?.role === 'driver';
  const driver = currentUser as DriverProfile;

  // Profile Information
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [avatarPreview, setAvatarPreview] = useState(currentUser?.avatar || '');

  // Driver Specifics
  const [status, setStatus] = useState<DriverProfile['status']>(driver?.status || 'available');
  const [location, setLocation] = useState(driver?.currentLocation || '');
  const [locationComment, setLocationComment] = useState('');
  const [trailerPlate, setTrailerPlate] = useState(driver?.trailerPlate || '');
  const [vehicleCategory, setVehicleCategory] = useState(driver?.vehicleCategory || '');
  const [vehicleType, setVehicleType] = useState(driver?.vehicleType || '');
  const [vehiclePlate, setVehiclePlate] = useState(driver?.vehiclePlate || '');
  const [vehicleModel, setVehicleModel] = useState(driver?.vehicleModel || '');
  const [vehiclePreview, setVehiclePreview] = useState(driver?.vehicleImage || '');

  // Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const vehicleInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'vehicle') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'avatar') setAvatarPreview(reader.result as string);
        else setVehiclePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    try {
      const updates: any = {
        name,
        email,
        phone,
        avatar: avatarPreview,
      };

      if (isDriver) {
        Object.assign(updates, {
          status,
          currentLocation: location,
          trailerPlate,
          vehicleCategory,
          vehicleType,
          vehiclePlate,
          vehicleModel,
          vehicleImage: vehiclePreview,
          locationComment
        });
      }

      await updateProfile(updates);
      setLocationComment('');
    } catch (error) {
      // Error handled by store
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      // Error handled by store
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-end gap-6 pb-6 border-b">
        <div className="relative group/avatar">
          <input
            type="file"
            ref={avatarInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'avatar')}
          />
          <div className="w-32 h-32 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-4xl font-bold text-slate-400 shadow-xl overflow-hidden relative group">
            {avatarPreview ? (
              <img src={avatarPreview} alt={currentUser.name} className="w-full h-full object-cover" />
            ) : (
              currentUser.name.charAt(0)
            )}
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Camera size={24} className="text-white" />
            </button>
          </div>
        </div>
        <div className="flex-1 space-y-1">
          <h1 className="text-3xl font-bold text-foreground">{currentUser.name}</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-bold uppercase tracking-wider">
              {currentUser.role}
            </span>
            • {currentUser.email}
          </p>
        </div>
        <Button onClick={handleSaveProfile} disabled={isSaving} className="w-full md:w-auto">
          <Save size={18} className="mr-2" />
          {isSaving ? 'Saving Changes...' : 'Save All Changes'}
        </Button>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          {isDriver && <TabsTrigger value="vehicle">Vehicle & Status</TabsTrigger>}
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update your personal details and contact information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                      placeholder="+260 9xx xxx xxx"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {isDriver && (
          <TabsContent value="vehicle" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Truck size={18} className="text-blue-500" /> Availability
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-2">
                    {(['available', 'busy', 'offline'] as const).map((s) => (
                      <Button
                        key={s}
                        variant={status === s ? "default" : "outline"}
                        className={`justify-start gap-3 h-12 ${status === s ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                        onClick={() => setStatus(s)}
                      >
                        <div className={`w-2.5 h-2.5 rounded-full ${s === 'available' ? 'bg-emerald-500' : s === 'busy' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                        <span className="capitalize">{s}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin size={18} className="text-rose-500" /> Current Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Lusaka, Central"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Comment</Label>
                    <Input
                      value={locationComment}
                      onChange={(e) => setLocationComment(e.target.value)}
                      placeholder="e.g. Loading cargo..."
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Vehicle Details</CardTitle>
                <div className="relative group/vehicle h-48 w-full bg-slate-100 rounded-xl overflow-hidden mt-4">
                  <input
                    type="file"
                    ref={vehicleInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'vehicle')}
                  />
                  {vehiclePreview ? (
                    <img src={vehiclePreview} alt="Vehicle" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                      <Truck size={48} className="mb-2" />
                      <p className="text-sm font-medium">No vehicle photo</p>
                    </div>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-4 right-4 bg-white/90 backdrop-blur shadow-sm hover:bg-white"
                    onClick={() => vehicleInputRef.current?.click()}
                  >
                    <Camera size={16} className="mr-2" />
                    Change Photo
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label>Make / Model</Label>
                    <Input value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Vehicle Type</Label>
                    <Input value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Number Plate</Label>
                    <Input value={vehiclePlate} onChange={(e) => setVehiclePlate(e.target.value)} className="font-mono uppercase" />
                  </div>
                  <div className="space-y-2">
                    <Label>Trailer Plate</Label>
                    <Input value={trailerPlate} onChange={(e) => setTrailerPlate(e.target.value)} className="font-mono uppercase" />
                  </div>
                  <div className="space-y-2 lg:col-span-2">
                    <Label>Category</Label>
                    <select
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                      value={vehicleCategory}
                      onChange={(e) => setVehicleCategory(e.target.value)}
                    >
                      <option value="">Select Category...</option>
                      {['Delivery Van', 'Box Truck', 'Flatbed Truck', 'Refrigerated Truck', 'Tanker', 'Tipper', 'Curtain Sider'].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" disabled={isChangingPassword} className="w-full">
                  {isChangingPassword ? 'Updating Password...' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
