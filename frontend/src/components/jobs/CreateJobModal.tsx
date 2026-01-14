import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { toast } from 'sonner';

interface CreateJobModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateJobModal = ({ isOpen, onClose }: CreateJobModalProps) => {
    const { createJob } = useStore();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        origin: '',
        destination: '',
        budget: '',
        pickupDate: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await createJob({
                ...formData,
                budget: Number(formData.budget),
                pickupDate: new Date(formData.pickupDate).toISOString()
            });
            toast.success('Job posted successfully!');
            onClose();
            setFormData({
                title: '',
                description: '',
                origin: '',
                destination: '',
                budget: '',
                pickupDate: ''
            });
        } catch (error: any) {
            toast.error(error.message || 'Failed to post job');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-[#ba0b0b]">Post a New Load</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Job Title</Label>
                        <Input
                            id="title"
                            placeholder="e.g. 30T Flatbed needed for Mineral Transport"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="origin">Origin</Label>
                            <Input
                                id="origin"
                                placeholder="City, Country"
                                value={formData.origin}
                                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="destination">Destination</Label>
                            <Input
                                id="destination"
                                placeholder="City, Country"
                                value={formData.destination}
                                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="budget">Budget (USD)</Label>
                            <Input
                                id="budget"
                                type="number"
                                placeholder="500"
                                value={formData.budget}
                                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pickupDate">Pickup Date</Label>
                            <Input
                                id="pickupDate"
                                type="date"
                                value={formData.pickupDate}
                                onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Full Description & Requirements</Label>
                        <Textarea
                            id="description"
                            placeholder="Detail cargo type, weight, specific requirements..."
                            className="h-32"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-[#ba0b0b] hover:bg-[#950606]" disabled={loading}>
                            {loading ? 'Posting...' : 'Post Job'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
