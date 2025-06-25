import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users, Search, Filter, MoreVertical, Edit, Trash2, Ban, CheckCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  lastLogin: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await apiRequest('GET', '/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleToggleUserStatus = async (userId: number, isActive: boolean) => {
    try {
      const response = await apiRequest('PUT', `/api/admin/users/${userId}`, {
        isActive: !isActive
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: `User ${!isActive ? 'activated' : 'deactivated'} successfully`
        });
        await fetchUsers();
      } else {
        throw new Error('Failed to update user status');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (userId: number, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await apiRequest('DELETE', `/api/admin/users/${userId}`);
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "User deleted successfully"
        });
        await fetchUsers();
      } else {
        throw new Error('Failed to delete user');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const getUserStatusBadge = (user: User) => {
    if (!user.isActive) {
      return <Badge variant="destructive">Inactive</Badge>;
    }
    if (!user.emailVerified) {
      return <Badge variant="secondary">Pending Verification</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: 'default',
      user: 'secondary',
      employer: 'outline'
    };
    
    return <Badge variant={variants[role] || 'outline'}>{role.charAt(0).toUpperCase() + role.slice(1)}</Badge>;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage platform users and their permissions</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{filteredUsers.length} users</Badge>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by username, email, or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="role-filter">Filter by Role</Label>
              <select
                id="role-filter"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="employer">Employer</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="grid gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{user.name || user.username}</h3>
                    {getRoleBadge(user.role)}
                    {getUserStatusBadge(user)}
                  </div>
                  
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p><strong>Username:</strong> {user.username}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>User ID:</strong> {user.id}</p>
                    <p><strong>Created:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                    {user.lastLogin && (
                      <p><strong>Last Login:</strong> {new Date(user.lastLogin).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant={user.isActive ? "outline" : "default"}
                    onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                  >
                    {user.isActive ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                  </Button>
                  
                  {user.role !== 'admin' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteUser(user.id, user.username)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredUsers.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No users found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterRole !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'No users registered yet'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}