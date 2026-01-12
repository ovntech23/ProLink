import { Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import fleetImage from '../../assets/fleet-delivery-trucks.png';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}

const StatCard = ({ title, value, icon: Icon, color }: StatCardProps) => (
  <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </div>
);

export const BrokerDashboard = () => {
  const { shipments, drivers, initRealTimeUpdates } = useStore();
  const totalShipments = shipments.length;
  const activeShipments = shipments.filter(s => ['pending', 'assigned', 'picked_up', 'in_transit'].includes(s.status)).length;
  const completedShipments = shipments.filter(s => s.status === 'delivered').length;
  const availableDrivers = drivers.filter(d => d.status === 'available').length;

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
      <div className="relative z-10">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Shipments"
            value={totalShipments}
            icon={Package}
            color="bg-blue-500"
          />
          <StatCard
            title="Active Shipments"
            value={activeShipments}
            icon={Truck}
            color="bg-amber-500"
          />
          <StatCard
            title="Completed"
            value={completedShipments}
            icon={CheckCircle}
            color="bg-emerald-500"
          />
          <StatCard
            title="Available Drivers"
            value={availableDrivers}
            icon={Clock}
            color="bg-purple-500"
          />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Recent Shipments</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tracking ID</TableHead>
                    <TableHead>Origin</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shipments.slice(0, 5).map((shipment) => (
                    <TableRow key={shipment.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-medium text-blue-600">{shipment.trackingId}</TableCell>
                      <TableCell>{shipment.origin}</TableCell>
                      <TableCell>{shipment.destination}</TableCell>
                      <TableCell>
                        <Badge
                          variant={shipment.status === 'delivered' ? 'default' : shipment.status === 'pending' ? 'secondary' : 'outline'}
                          className={shipment.status === 'delivered' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' : shipment.status === 'pending' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' : 'bg-blue-100 text-blue-800 hover:bg-blue-100'}
                        >
                          {shipment.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{shipment.pickupDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {shipments.slice(0, 5).map((shipment) => (
                <div key={shipment.id} className="bg-card p-4 rounded-lg border border-border hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {shipment.trackingId}
                    </span>
                    <Badge
                      variant={shipment.status === 'delivered' ? 'default' : shipment.status === 'pending' ? 'secondary' : 'outline'}
                      className={shipment.status === 'delivered' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' : shipment.status === 'pending' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' : 'bg-blue-100 text-blue-800 hover:bg-blue-100'}
                    >
                      {shipment.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">From:</span>
                      <span className="text-sm font-medium">{shipment.origin}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">To:</span>
                      <span className="text-sm font-medium">{shipment.destination}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Date:</span>
                      <span className="text-sm text-muted-foreground">{shipment.pickupDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
