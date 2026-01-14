import { Truck, CheckCircle, AlertTriangle, Send, X } from 'lucide-react';
import type { Shipment } from '../../store/useStore';
import { useStore } from '../../store/useStore';
import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react';
import fleetImage from '../../assets/fleet-delivery-trucks.png';

export const JobBoard = () => {
  const { shipments, currentUser, updateShipmentStatus, reportShipmentIncident, initRealTimeUpdates } = useStore();
  const [reportingIncidentId, setReportingIncidentId] = useState<string | null>(null);
  const [incidentNote, setIncidentNote] = useState('');

  // Initialize real-time updates when component mounts
  useEffect(() => {
    initRealTimeUpdates();
  }, [initRealTimeUpdates]);

  // Filter for shipments assigned to this driver
  const myJobs = shipments.filter(s => s.driverId === currentUser?.id);
  const activeJobs = myJobs.filter(s => ['assigned', 'picked_up', 'in_transit'].includes(s.status));
  const completedJobs = myJobs.filter(s => s.status === 'delivered');

  const handleStatusUpdate = (shipmentId: string, currentStatus: Shipment['status']) => {
    let nextStatus: Shipment['status'] = 'pending';
    let note = '';
    switch (currentStatus) {
      case 'assigned':
        nextStatus = 'picked_up';
        note = 'Driver confirmed pickup';
        break;
      case 'picked_up':
        nextStatus = 'in_transit';
        note = 'Driver started transit';
        break;
      case 'in_transit':
        nextStatus = 'delivered';
        note = 'Driver confirmed delivery';
        break;
      default:
        return;
    }
    updateShipmentStatus(shipmentId, nextStatus, note);
  };

  const handleReportIncident = (shipmentId: string) => {
    if (!incidentNote.trim()) return;
    reportShipmentIncident(shipmentId, incidentNote);
    setReportingIncidentId(null);
    setIncidentNote('');
  };

  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div className="absolute inset-0 w-screen h-screen opacity-10 pointer-events-none z-0 overflow-hidden">
        <img src={fleetImage} alt="Fleet Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-navy-900 opacity-50"></div>
      </div>

      {/* Existing Content */}
      <div className="relative z-10">
        <div>
          <h2 className="text-2xl font-bold text-[#950606]">My Jobs</h2>
          <p className="text-muted-foreground">Manage your active deliveries</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-slate-700 mb-4">
              <Truck size={20} />
              Active Jobs
            </h3>
            {activeJobs.length > 0 ? (
              activeJobs.map(job => (
                <JobCard
                  key={job.id}
                  shipment={job}
                  reportingIncidentId={reportingIncidentId}
                  setReportingIncidentId={setReportingIncidentId}
                  incidentNote={incidentNote}
                  setIncidentNote={setIncidentNote}
                  onReportIncident={handleReportIncident}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))
            ) : (
              <div className="p-8 bg-slate-50 rounded-xl border border-dashed text-center text-slate-500">
                No active jobs
              </div>
            )}
          </div>
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-slate-700 mb-4">
              <CheckCircle size={20} />
              Completed History
            </h3>
            {completedJobs.slice(0, 3).map(job => (
              <JobCard
                key={job.id}
                shipment={job}
                reportingIncidentId={reportingIncidentId}
                setReportingIncidentId={setReportingIncidentId}
                incidentNote={incidentNote}
                setIncidentNote={setIncidentNote}
                onReportIncident={handleReportIncident}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface JobCardProps {
  shipment: Shipment;
  reportingIncidentId: string | null;
  setReportingIncidentId: (id: string | null) => void;
  incidentNote: string;
  setIncidentNote: (note: string) => void;
  onReportIncident: (id: string) => void;
  onStatusUpdate: (id: string, status: Shipment['status']) => void;
}

const JobCard = ({
  shipment,
  reportingIncidentId,
  setReportingIncidentId,
  incidentNote,
  setIncidentNote,
  onReportIncident,
  onStatusUpdate
}: JobCardProps) => (
  <div className="bg-card p-6 rounded-xl shadow-sm border border-border mb-4">
    <div className="flex items-center justify-between mb-4">
      <span className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
        {shipment.trackingId}
      </span>
      <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${shipment.status === 'in_transit' ? 'bg-amber-100 text-amber-700' : shipment.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
        {shipment.status.replace('_', ' ')}
      </span>
    </div>
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="mt-1">
          <div className="w-2 h-2 rounded-full bg-blue-400 mb-1"></div>
          <div className="w-0.5 h-full bg-slate-200 ml-0.75"></div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase font-semibold">Pickup</p>
          <p className="text-foreground font-medium">{shipment.origin}</p>
          <p className="text-xs text-muted-foreground">{new Date(shipment.pickupDate).toLocaleDateString()}</p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <div className="mt-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase font-semibold">Dropoff</p>
          <p className="text-foreground font-medium">{shipment.destination}</p>
        </div>
      </div>
    </div>
    <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        <span className="block">{shipment.cargoType}</span>
        <span className="block">{shipment.weight}</span>
      </div>
      <div className="flex gap-2">
        {shipment.status !== 'delivered' && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="border-amber-200 text-amber-600 hover:bg-amber-50"
              onClick={() => setReportingIncidentId(shipment.id)}
            >
              <AlertTriangle size={14} className="mr-1" /> Problem
            </Button>
            <Button onClick={() => onStatusUpdate(shipment.id, shipment.status)} size="sm">
              {shipment.status === 'assigned' && 'Confirm Pickup'}
              {shipment.status === 'picked_up' && 'Start Transit'}
              {shipment.status === 'in_transit' && 'Confirm Delivery'}
            </Button>
          </>
        )}
      </div>
    </div>

    {reportingIncidentId === shipment.id && (
      <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-100 animate-in fade-in slide-in-from-top-2">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-amber-800 uppercase tracking-tighter">Report Incident / Breakdown</h4>
          <button onClick={() => setReportingIncidentId(null)}><X size={14} className="text-amber-400" /></button>
        </div>
        <textarea
          id="incident-note"
          name="incident-note"
          className="w-full h-20 p-2 text-sm bg-white border border-amber-200 rounded-md focus:ring-1 focus:ring-amber-500 outline-none resize-none"
          placeholder="Describe the issue (e.g. Mechanical breakdown at Kabwe)..."
          value={incidentNote}
          onChange={(e) => setIncidentNote(e.target.value)}
        />
        <Button
          className="w-full mt-2 bg-amber-600 hover:bg-amber-700"
          size="sm"
          onClick={() => onReportIncident(shipment.id)}
        >
          <Send size={14} className="mr-2" /> Broadcast to Client & Dispatch
        </Button>
      </div>
    )}
  </div>
);
