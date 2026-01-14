import { useState } from 'react';
import { useStore } from '../../store/useStore';
import type { User } from '../../store/useStore';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";

export const UserManagement = () => {
    const { users, adminCreateUser, adminUpdateUser, deleteUser } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'driver',
        phone: ''
    });

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreate = async () => {
        try {
            await adminCreateUser(formData);
            setIsAddDialogOpen(false);
            setFormData({ name: '', email: '', password: '', role: 'driver', phone: '' });
            toast({ title: "Success", description: "User created successfully" });
        } catch (error) {
            toast({ title: "Error", description: "Failed to create user", variant: "destructive" });
        }
    };

    const handleUpdate = async () => {
        if (!currentUser) return;
        try {
            const updates: any = {
                name: formData.name,
                email: formData.email,
                role: formData.role,
                phone: formData.phone
            };
            if (formData.password) {
                updates.password = formData.password;
            }
            await adminUpdateUser(currentUser.id, updates);
            setIsEditDialogOpen(false);
            setCurrentUser(null);
            setFormData({ name: '', email: '', password: '', role: 'driver', phone: '' });
            toast({ title: "Success", description: "User updated successfully" });
        } catch (error) {
            toast({ title: "Error", description: "Failed to update user", variant: "destructive" });
        }
    };

    const openEditDialog = (user: User) => {
        setCurrentUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '', // Don't show existing password
            role: user.role,
            phone: user.phone || ''
        });
        setIsEditDialogOpen(true);
    };

    const handleDelete = async (userId: string) => {
        try {
            await deleteUser(userId);
            toast({ title: "Success", description: "User deleted successfully" });
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete user", variant: "destructive" });
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-800 hover:bg-red-100';
            case 'broker': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
            case 'owner': return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
            case 'driver': return 'bg-teal-100 text-teal-800 hover:bg-teal-100';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground">Manage system users, roles, and permissions.</p>
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)} className="bg-[#950606] hover:bg-[#7a0505]">
                    <Plus className="mr-2 h-4 w-4" /> Add User
                </Button>
            </div>

            <div className="flex items-center gap-2 max-w-sm">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={user.avatar} alt={user.name} className="object-cover" />
                                            <AvatarFallback className="bg-[#ba0b0b] text-white">
                                                {user.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{user.name}</span>
                                            <span className="text-sm text-muted-foreground">{user.email}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge className={`${getRoleBadgeColor(user.role)} capitalize border-none shadow-none`}>
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>{user.phone || '-'}</TableCell>
                                <TableCell>
                                    <Badge variant={user.isApproved ? "default" : "secondary"} className={user.isApproved ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                                        {user.isApproved ? 'Active' : 'Pending'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the user account
                                                        for <strong>{user.name}</strong>.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(user.id)} className="bg-red-600 hover:bg-red-700">
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Create Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                        <DialogDescription>Create a new user account directly.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <select
                                id="role"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="driver">Driver</option>
                                <option value="owner">Cargo Owner</option>
                                <option value="broker">Broker</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone (Optional)</Label>
                            <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate} className="bg-[#950606] hover:bg-[#7a0505]">Create User</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>Update user details. Leave password blank to keep current.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input id="edit-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-email">Email</Label>
                            <Input id="edit-email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-password">New Password (Optional)</Label>
                            <Input id="edit-password" type="password" placeholder="Leave blank to keep current" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-role">Role</Label>
                            <select
                                id="edit-role"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="driver">Driver</option>
                                <option value="owner">Cargo Owner</option>
                                <option value="broker">Broker</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-phone">Phone</Label>
                            <Input id="edit-phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdate} className="bg-[#950606] hover:bg-[#7a0505]">Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
