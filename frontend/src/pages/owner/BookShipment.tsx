import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { CargoType } from '../../types/index';
import { CARGO_TYPE_LABELS } from '../../types/index';
import { Package, MapPin, Calendar, ArrowRight, CheckCircle2, Printer, ArrowLeft } from 'lucide-react';
import fleetImage from '../../assets/fleet-delivery-trucks.png';
import prolinkLogo from '../../assets/prolink logo.png';

export const BookShipment = () => {
  const { addShipment, currentUser } = useStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    cargoType: 'general' as CargoType,
    weight: '',
    length: '',
    width: '',
    height: '',
    quantity: '1',
    description: '',
    specialInstructions: '',
    pickupAddress: '',
    pickupCity: '',
    pickupContactPerson: '',
    pickupContactPhone: '',
    deliveryAddress: '',
    deliveryCity: '',
    deliveryContactPerson: '',
    deliveryContactPhone: '',
    scheduledPickupDate: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastShipmentId, setLastShipmentId] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsSubmitting(true);

    try {
      const newShipment = await addShipment({
        ownerId: currentUser.id,
        cargoType: formData.cargoType,
        weight: `${formData.weight}kg`,
        dimensions: {
          length: parseFloat(formData.length || '0'),
          width: parseFloat(formData.width || '0'),
          height: parseFloat(formData.height || '0'),
        },
        quantity: parseInt(formData.quantity || '1'),
        description: formData.description,
        specialInstructions: formData.specialInstructions,
        origin: `${formData.pickupAddress}, ${formData.pickupCity}`,
        destination: `${formData.deliveryAddress}, ${formData.deliveryCity}`,
        pickupContactPerson: formData.pickupContactPerson,
        pickupContactPhone: formData.pickupContactPhone,
        deliveryContactPerson: formData.deliveryContactPerson,
        deliveryContactPhone: formData.deliveryContactPhone,
        pickupDate: formData.scheduledPickupDate,
        status: 'pending',
      });

      setLastShipmentId(newShipment.trackingId);
      setIsSuccess(true);
      toast({
        title: 'Shipment booked!',
        description: `Your shipment ${newShipment.trackingId} has been created successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create shipment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Background Image */}
      <div className="absolute inset-0 w-screen h-screen opacity-10 pointer-events-none z-0 overflow-hidden">
        <img src={fleetImage} alt="Fleet Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-navy-900 opacity-50"></div>
      </div>

      {/* Existing Content */}
      <div className="relative z-10">
        <div className="px-4 sm:px-0 no-print">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#ba0b0b]">Book Shipment</h1>
          <p className="text-muted-foreground text-sm sm:base mt-1">Fill in the details to request a new shipment</p>
        </div>

        {isSuccess ? (
          <div className="space-y-6 animate-scale-in">
            <Card className="glass border-success/20 overflow-hidden">
              <div className="bg-success/10 p-8 text-center border-b border-success/10 no-print">
                <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-10 w-10 text-success" />
                </div>
                <h2 className="text-2xl font-bold text-success mb-2">Booking Confirmed!</h2>
                <p className="text-muted-foreground font-medium">Your shipment ID is <span className="text-foreground font-bold">{lastShipmentId}</span></p>
              </div>

              {/* Printable Area */}
              <CardContent className="p-8 space-y-8" id="printable-booking">
                {/* PDF Header - Only visible when printing */}
                <div className="hidden print:flex justify-between items-center border-b-2 border-[#ba0b0b] pb-6 mb-8">
                  <div className="flex items-center gap-3">
                    <img src={prolinkLogo} alt="Logo" className="w-12 h-12" />
                    <div>
                      <h3 className="text-2xl font-black text-[#ba0b0b] tracking-tighter uppercase">ProLink</h3>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Professional Logistics Network</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h4 className="text-lg font-bold text-slate-900">BOOKING RECEIPT</h4>
                    <p className="text-sm text-slate-500 font-mono">{lastShipmentId}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{new Date().toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[11px] font-bold text-[#ba0b0b] uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Package size={14} /> Cargo Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Type:</span>
                          <span className="font-bold capitalize">{CARGO_TYPE_LABELS[formData.cargoType]}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Description:</span>
                          <span className="font-bold">{formData.description}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Weight:</span>
                          <span className="font-bold">{formData.weight}kg</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Dimensions:</span>
                          <span className="font-bold">{formData.length}x{formData.width}x{formData.height} cm</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Quantity:</span>
                          <span className="font-bold">{formData.quantity} units</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[11px] font-bold text-[#ba0b0b] uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Calendar size={14} /> Schedule
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Pickup Date:</span>
                          <span className="font-bold">{formData.scheduledPickupDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[11px] font-bold text-[#ba0b0b] uppercase tracking-widest mb-3 flex items-center gap-2">
                        <MapPin size={14} /> Logistics Route
                      </h4>
                      <div className="space-y-4">
                        <div className="relative pl-6 pb-4 border-l-2 border-slate-100">
                          <div className="absolute -left-1.25 top-0 w-2 h-2 rounded-full bg-slate-400"></div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Origin</p>
                          <p className="text-sm font-bold">{formData.pickupAddress}, {formData.pickupCity}</p>
                          <p className="text-xs text-slate-500">{formData.pickupContactPerson} • {formData.pickupContactPhone}</p>
                        </div>
                        <div className="relative pl-6">
                          <div className="absolute -left-1.25 top-0 w-2 h-2 rounded-full bg-[#ba0b0b]"></div>
                          <p className="text-[10px] font-bold text-[#ba0b0b] uppercase tracking-tight">Destination</p>
                          <p className="text-sm font-bold">{formData.deliveryAddress}, {formData.deliveryCity}</p>
                          <p className="text-xs text-slate-500">{formData.deliveryContactPerson} • {formData.deliveryContactPhone}</p>
                        </div>
                      </div>
                    </div>

                    {formData.specialInstructions && (
                      <div>
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Special Instructions</h4>
                        <div className="p-3 bg-slate-50 rounded-lg text-xs italic text-slate-600 border border-slate-100">
                          "{formData.specialInstructions}"
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* PDF Footer */}
                <div className="hidden print:block pt-8 mt-12 border-t border-slate-100">
                  <div className="flex justify-between items-end">
                    <div className="text-[9px] text-slate-400 leading-relaxed uppercase tracking-wider">
                      ProLink Logistics • 17 Nangwenya Road • Lusaka, Zambia<br />
                      www.prolinkafrica.com • +260 977 596 029
                    </div>
                    <div className="w-16 h-16 bg-slate-100 rounded flex items-center justify-center text-[10px] font-bold text-slate-300 border border-slate-200">
                      QR CODE
                    </div>
                  </div>
                </div>
              </CardContent>

              <div className="p-6 bg-slate-50 border-t border-border flex flex-col sm:flex-row gap-4 no-print">
                <Button
                  onClick={() => window.print()}
                  className="flex-1 h-12 bg-[#ba0b0b] hover:bg-[#940909] gap-2 shadow-lg shadow-[#ba0b0b]/20"
                >
                  <Printer size={18} />
                  Print / Download PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/owner/shipments')}
                  className="flex-1 h-12 gap-2"
                >
                  <ArrowRight size={18} />
                  Go to Shipments
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setIsSuccess(false)}
                  className="flex-1 h-12 gap-2"
                >
                  <ArrowLeft size={18} />
                  Book Another
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cargo Details */}
            <Card className="glass">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Cargo Details</CardTitle>
                    <CardDescription>What are you shipping?</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cargoType">Cargo Type</Label>
                    <Select name="cargoType" value={formData.cargoType} onValueChange={(v) => handleChange('cargoType', v)}>
                      <SelectTrigger id="cargoType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CARGO_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => handleChange('quantity', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    placeholder="Brief description of the cargo"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.weight}
                      onChange={(e) => handleChange('weight', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="length">Length (cm)</Label>
                    <Input
                      id="length"
                      name="length"
                      type="number"
                      min="0"
                      value={formData.length}
                      onChange={(e) => handleChange('length', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="width">Width (cm)</Label>
                    <Input
                      id="width"
                      name="width"
                      type="number"
                      min="0"
                      value={formData.width}
                      onChange={(e) => handleChange('width', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      name="height"
                      type="number"
                      min="0"
                      value={formData.height}
                      onChange={(e) => handleChange('height', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialInstructions">Special Instructions (optional)</Label>
                  <Textarea
                    id="specialInstructions"
                    name="specialInstructions"
                    placeholder="Any special handling requirements..."
                    value={formData.specialInstructions}
                    onChange={(e) => handleChange('specialInstructions', e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Locations */}
            <Card className="glass">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Pickup & Delivery</CardTitle>
                    <CardDescription>Where should we pickup and deliver?</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Pickup */}
                  <div className="space-y-4 p-4 rounded-lg bg-muted/50">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Pickup Location</h4>
                    <div className="space-y-2">
                      <Label htmlFor="pickupAddress">Address</Label>
                      <Input
                        id="pickupAddress"
                        name="pickupAddress"
                        placeholder="Street address"
                        value={formData.pickupAddress}
                        onChange={(e) => handleChange('pickupAddress', e.target.value)}
                        required
                        autoComplete="address-line1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pickupCity">City</Label>
                      <Input
                        id="pickupCity"
                        name="pickupCity"
                        placeholder="City"
                        value={formData.pickupCity}
                        onChange={(e) => handleChange('pickupCity', e.target.value)}
                        required
                        autoComplete="address-level2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pickupContactPerson">Contact Person</Label>
                      <Input
                        id="pickupContactPerson"
                        name="pickupContactPerson"
                        placeholder="Name of contact person"
                        value={formData.pickupContactPerson}
                        onChange={(e) => handleChange('pickupContactPerson', e.target.value)}
                        autoComplete="name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pickupContactPhone">Contact Phone</Label>
                      <Input
                        id="pickupContactPhone"
                        name="pickupContactPhone"
                        type="tel"
                        placeholder="Phone number"
                        value={formData.pickupContactPhone}
                        onChange={(e) => handleChange('pickupContactPhone', e.target.value)}
                        autoComplete="tel"
                      />
                    </div>
                  </div>

                  {/* Delivery */}
                  <div className="space-y-4 p-4 rounded-lg bg-muted/50">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Delivery Location</h4>
                    <div className="space-y-2">
                      <Label htmlFor="deliveryAddress">Address</Label>
                      <Input
                        id="deliveryAddress"
                        name="deliveryAddress"
                        placeholder="Street address"
                        value={formData.deliveryAddress}
                        onChange={(e) => handleChange('deliveryAddress', e.target.value)}
                        required
                        autoComplete="address-line1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deliveryCity">City</Label>
                      <Input
                        id="deliveryCity"
                        name="deliveryCity"
                        placeholder="City"
                        value={formData.deliveryCity}
                        onChange={(e) => handleChange('deliveryCity', e.target.value)}
                        required
                        autoComplete="address-level2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deliveryContactPerson">Contact Person</Label>
                      <Input
                        id="deliveryContactPerson"
                        name="deliveryContactPerson"
                        placeholder="Name of contact person"
                        value={formData.deliveryContactPerson}
                        onChange={(e) => handleChange('deliveryContactPerson', e.target.value)}
                        autoComplete="name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deliveryContactPhone">Contact Phone</Label>
                      <Input
                        id="deliveryContactPhone"
                        name="deliveryContactPhone"
                        type="tel"
                        placeholder="Phone number"
                        value={formData.deliveryContactPhone}
                        onChange={(e) => handleChange('deliveryContactPhone', e.target.value)}
                        autoComplete="tel"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card className="glass">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Schedule</CardTitle>
                    <CardDescription>When should we pick up the cargo?</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-w-xs">
                  <Label htmlFor="scheduledPickupDate">Preferred Pickup Date</Label>
                  <Input
                    id="scheduledPickupDate"
                    name="scheduledPickupDate"
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.scheduledPickupDate}
                    onChange={(e) => handleChange('scheduledPickupDate', e.target.value)}
                    className="mt-2"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end px-4 sm:px-0">
              <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? 'Booking...' : 'Book Shipment'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
