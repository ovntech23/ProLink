import { useState } from 'react';
import { useStore, type Payment } from '../../store/useStore';
import { Search, Filter, Download, ArrowUpRight, ArrowDownLeft, CheckCircle, Clock, AlertCircle, Calendar, CreditCard, User, Hash, Truck } from 'lucide-react';
import clsx from 'clsx';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import fleetImage from '../../assets/fleet-delivery-trucks.png';

export const Billing = () => {
  const { payments, addPayment } = useStore();
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [exporting, setExporting] = useState(false);

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    type: 'client_invoice' as 'client_invoice' | 'driver_payment',
    amount: '',
    currency: 'ZMW',
    payer: '',
    payee: '',
    shipmentId: '',
    status: 'pending' as 'pending' | 'completed' | 'failed'
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filteredPayments = payments.filter(payment => {
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesSearch = payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.payer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.payee.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalRevenue = payments
    .filter(p => p.type === 'client_invoice' && p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalExpenses = payments
    .filter(p => p.type === 'driver_payment' && p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPayments = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingCount = payments.filter(p => p.status === 'pending').length;

  const formatCurrency = (amount: number, currency: string = 'ZMW') => {
    return new Intl.NumberFormat('en-ZM', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Form validation
  const validatePaymentForm = () => {
    const errors: Record<string, string> = {};
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      errors.amount = 'Please enter a valid amount';
    }
    if (!paymentForm.payer.trim()) {
      errors.payer = 'Payer is required';
    }
    if (!paymentForm.payee.trim()) {
      errors.payee = 'Payee is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle payment recording
  const handleRecordPayment = () => {
    if (!validatePaymentForm()) return;

    const newPayment = {
      shipmentId: paymentForm.shipmentId || 'N/A',
      amount: parseFloat(paymentForm.amount),
      currency: paymentForm.currency,
      status: paymentForm.status,
      date: new Date().toISOString(),
      payer: paymentForm.payer,
      payee: paymentForm.payee,
      type: paymentForm.type
    };

    addPayment(newPayment);
    setShowPaymentModal(false);

    // Reset form
    setPaymentForm({
      type: 'client_invoice',
      amount: '',
      currency: 'ZMW',
      payer: '',
      payee: '',
      shipmentId: '',
      status: 'pending'
    });
    setFormErrors({});
  };

  // Handle export report
  const handleExportReport = () => {
    setExporting(true);

    // Create CSV content
    const headers = ['ID', 'Shipment ID', 'Amount', 'Currency', 'Status', 'Date', 'Payer', 'Payee', 'Type'];
    const rows = filteredPayments.map(payment => [
      payment.id,
      payment.shipmentId,
      payment.amount,
      payment.currency,
      payment.status,
      new Date(payment.date).toLocaleDateString(),
      payment.payer,
      payment.payee,
      payment.type
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `payments-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExporting(false);
  };

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-500/10';
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/10';
      case 'failed':
        return 'text-[#ba0b0b] bg-[#ba0b0b]/10';
      default:
        return 'text-slate-400 bg-slate-500/10';
    }
  };

  const getStatusIcon = (status: Payment['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} />;
      case 'pending':
        return <Clock size={16} />;
      case 'failed':
        return <AlertCircle size={16} />;
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div className="absolute inset-0 w-screen h-screen opacity-10 pointer-events-none z-0 overflow-hidden">
        <img src={fleetImage} alt="Fleet Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-navy-900 opacity-50"></div>
      </div>

      {/* Existing Content */}
      <div className="relative z-10 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#ba0b0b] mb-2">Billing & Payments</h1>
            <p className="text-muted-foreground text-sm sm:base">Manage invoices and driver payments</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              className="flex items-center gap-2 w-full sm:w-auto"
              onClick={handleExportReport}
              disabled={exporting}
            >
              <Download size={18} />
              {exporting ? 'Exporting...' : 'Export Report'}
            </Button>
            <Button onClick={() => setShowPaymentModal(true)} className="w-full sm:w-auto">
              Record Payment
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-xl border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <ArrowUpRight size={24} />
              </div>
              <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded">+12.5%</span>
            </div>
            <p className="text-muted-foreground text-sm mb-1">Total Revenue</p>
            <h3 className="text-2xl font-bold text-foreground">{formatCurrency(totalRevenue, 'ZMW')}</h3>
          </div>

          <div className="bg-white p-6 rounded-xl border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-secondary/10 rounded-lg text-secondary">
                <ArrowDownLeft size={24} />
              </div>
              <span className="text-xs font-medium text-muted-foreground bg-muted/10 px-2 py-1 rounded">+5.2%</span>
            </div>
            <p className="text-muted-foreground text-sm mb-1">Total Expenses</p>
            <h3 className="text-2xl font-bold text-foreground">{formatCurrency(totalExpenses, 'ZMW')}</h3>
          </div>

          <div className="bg-white p-6 rounded-xl border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-warning/10 rounded-lg text-warning">
                <Clock size={24} />
              </div>
              <span className="text-xs font-medium text-warning bg-warning/10 px-2 py-1 rounded">{pendingCount} Pending</span>
            </div>
            <p className="text-muted-foreground text-sm mb-1">Pending Payments</p>
            <h3 className="text-2xl font-bold text-foreground">{formatCurrency(pendingPayments, 'ZMW')}</h3>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card p-4 rounded-xl border border-border flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="text"
                id="search-payments"
                name="search-payments"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors bg-background"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {(['all', 'pending', 'completed', 'failed'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={clsx(
                    'px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors whitespace-nowrap',
                    filterStatus === status
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors justify-center md:justify-start">
            <Filter size={18} />
            <span>More Filters</span>
          </button>
        </div>

        {/* List */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-border">
            <table className="w-full text-left min-w-250 lg:min-w-full">
              <thead className="bg-muted text-muted-foreground text-xs uppercase font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Reference ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">To/From</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedPayment(payment);
                      setShowPaymentDetails(true);
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-foreground font-semibold">#{payment.id.toUpperCase()}</span>
                      <div className="text-xs text-muted-foreground mt-1 tracking-tight">Ref: {payment.shipmentId}</div>
                    </td>
                    <td className="px-6 py-4 text-foreground whitespace-nowrap">
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx(
                        'px-2.5 py-1 rounded-md text-xs font-semibold capitalize',
                        payment.type === 'client_invoice'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-secondary/10 text-secondary'
                      )}>
                        {payment.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-foreground whitespace-nowrap max-w-50 truncate">
                      {payment.type === 'client_invoice' ? payment.payer : payment.payee}
                    </td>
                    <td className="px-6 py-4 text-foreground font-bold whitespace-nowrap">
                      {formatCurrency(payment.amount, payment.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={clsx('flex items-center gap-2 px-2.5 py-1 rounded-md w-fit text-xs font-semibold', getStatusColor(payment.status))}>
                        {getStatusIcon(payment.status)}
                        <span className="capitalize">{payment.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        className="text-primary hover:text-primary/80 text-sm font-semibold transition-colors"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click when clicking the button
                          setSelectedPayment(payment);
                          setShowPaymentDetails(true);
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredPayments.length === 0 && (
            <div className="p-12 text-center text-muted-foreground bg-muted/20">
              <div className="flex flex-col items-center gap-2">
                <Search size={32} className="opacity-20" />
                <p>No payments found matching your criteria.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Recording Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record New Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="payment-type">Payment Type</Label>
              <Select
                name="type"
                value={paymentForm.type}
                onValueChange={(value) => setPaymentForm({ ...paymentForm, type: value as 'client_invoice' | 'driver_payment' })}
              >
                <SelectTrigger id="payment-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client_invoice">Client Invoice</SelectItem>
                  <SelectItem value="driver_payment">Driver Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment-amount">Amount</Label>
                <Input
                  type="number"
                  id="payment-amount"
                  name="amount"
                  placeholder="0.00"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className={formErrors.amount ? 'border-[#ba0b0b]' : ''}
                />
                {formErrors.amount && <p className="text-sm text-[#ba0b0b]">{formErrors.amount}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-currency">Currency</Label>
                <Select
                  name="currency"
                  value={paymentForm.currency}
                  onValueChange={(value) => setPaymentForm({ ...paymentForm, currency: value })}
                >
                  <SelectTrigger id="payment-currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ZMW">ZMW</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-payer">
                {paymentForm.type === 'client_invoice' ? 'Client/Payer' : 'Driver/Payer'}
              </Label>
              <Input
                id="payment-payer"
                name="payer"
                placeholder={paymentForm.type === 'client_invoice' ? 'Client name' : 'Driver name'}
                value={paymentForm.payer}
                onChange={(e) => setPaymentForm({ ...paymentForm, payer: e.target.value })}
                className={formErrors.payer ? 'border-[#ba0b0b]' : ''}
              />
              {formErrors.payer && <p className="text-sm text-[#ba0b0b]">{formErrors.payer}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-payee">
                {paymentForm.type === 'client_invoice' ? 'Company/Payee' : 'Driver/Payee'}
              </Label>
              <Input
                id="payment-payee"
                name="payee"
                placeholder={paymentForm.type === 'client_invoice' ? 'Company name' : 'Driver name'}
                value={paymentForm.payee}
                onChange={(e) => setPaymentForm({ ...paymentForm, payee: e.target.value })}
                className={formErrors.payee ? 'border-[#ba0b0b]' : ''}
              />
              {formErrors.payee && <p className="text-sm text-[#ba0b0b]">{formErrors.payee}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-shipment-id">Shipment ID (Optional)</Label>
              <Input
                id="payment-shipment-id"
                name="shipmentId"
                placeholder="Shipment reference"
                value={paymentForm.shipmentId}
                onChange={(e) => setPaymentForm({ ...paymentForm, shipmentId: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-status">Status</Label>
              <Select
                name="status"
                value={paymentForm.status}
                onValueChange={(value) => setPaymentForm({ ...paymentForm, status: value as 'pending' | 'completed' | 'failed' })}
              >
                <SelectTrigger id="payment-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleRecordPayment}>
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Details Modal */}
      <Dialog open={showPaymentDetails} onOpenChange={setShowPaymentDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-6 py-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground">Transaction Summary</h3>
                  <div className={clsx('flex items-center gap-2 px-2 py-1 rounded text-xs font-medium capitalize', getStatusColor(selectedPayment.status))}>
                    {getStatusIcon(selectedPayment.status)}
                    <span>{selectedPayment.status}</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {selectedPayment.type === 'client_invoice' ? 'Client Invoice' : 'Driver Payment'}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-1">
                    <Hash size={16} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Transaction ID</p>
                    <p className="font-mono text-foreground">#{selectedPayment.id.toUpperCase()}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-1">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date & Time</p>
                    <p className="text-foreground">
                      {new Date(selectedPayment.date).toLocaleDateString()} at {new Date(selectedPayment.date).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-1">
                    <Truck size={16} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Shipment Reference</p>
                    <p className="font-mono text-foreground">{selectedPayment.shipmentId}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-1">
                    <User size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      {selectedPayment.type === 'client_invoice' ? 'From (Client)' : 'From (Company)'}
                    </p>
                    <p className="text-foreground">{selectedPayment.payer}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-1">
                    <User size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      {selectedPayment.type === 'client_invoice' ? 'To (Company)' : 'To (Driver)'}
                    </p>
                    <p className="text-foreground">{selectedPayment.payee}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-1">
                    <CreditCard size={16} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Currency</p>
                    <p className="text-foreground">{selectedPayment.currency}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowPaymentDetails(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
