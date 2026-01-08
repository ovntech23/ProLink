import { useStore } from '../../store/useStore';
import { Check, X, Shield, Package, Truck } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const UserApproval = () => {
    const { users, approveUser, deleteUser } = useStore();
    const pendingUsers = users.filter(u => !u.isApproved);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#950606]">Account Approvals</h2>
                    <p className="text-muted-foreground text-sm sm:base">Manage pending user registrations</p>
                </div>
            </div>

            {pendingUsers.length === 0 ? (
                <Card className="p-12 text-center">
                    <div className="flex flex-col items-center gap-4 text-muted-foreground">
                        <Check className="w-12 h-12 text-emerald-500" />
                        <p className="text-lg font-medium">All clear! No pending approvals.</p>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingUsers.map((user) => (
                        <Card key={user.id} className="bg-card shadow-sm border border-border hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center gap-4 pb-4">
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-600">
                                    {user.name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <CardTitle className="text-base font-bold">{user.name}</CardTitle>
                                    <CardDescription className="text-xs truncate">{user.email}</CardDescription>
                                </div>
                                <div className={`p-2 rounded-lg ${user.role === 'broker' ? 'bg-blue-50 text-blue-600' :
                                    user.role === 'owner' ? 'bg-purple-50 text-purple-600' :
                                        'bg-teal-50 text-teal-600'
                                    }`}>
                                    {user.role === 'broker' && <Shield size={18} />}
                                    {user.role === 'owner' && <Package size={18} />}
                                    {user.role === 'driver' && <Truck size={18} />}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-col gap-1 text-sm">
                                    <span className="text-muted-foreground font-medium uppercase tracking-tighter text-[10px]">Role</span>
                                    <span className="capitalize font-semibold text-foreground">{user.role}</span>
                                </div>
                                {user.phone && (
                                    <div className="flex flex-col gap-1 text-sm">
                                        <span className="text-muted-foreground font-medium uppercase tracking-tighter text-[10px]">Phone</span>
                                        <span className="font-semibold text-foreground">{user.phone}</span>
                                    </div>
                                )}
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                        size="sm"
                                        onClick={() => approveUser(user.id)}
                                    >
                                        <Check size={16} className="mr-2" /> Approve
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                        size="sm"
                                        onClick={() => deleteUser(user.id)}
                                    >
                                        <X size={16} className="mr-2" /> Reject
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserApproval;
