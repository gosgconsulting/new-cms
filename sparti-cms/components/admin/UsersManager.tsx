import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Shield, 
  Mail, 
  Calendar,
  MoreVertical,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  X,
  Save,
  Activity,
  UserCheck,
  UserX,
  Clock
} from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../utils/api';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'admin' | 'editor' | 'user';
  status: 'active' | 'inactive' | 'pending' | 'rejected';
  tenant_id: string | null;
  is_super_admin: boolean;
  is_active: boolean;
  email_verified: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

interface UserFormData {
  first_name: string;
  last_name: string;
  email: string;
  role: 'admin' | 'editor' | 'user';
  status: 'active' | 'inactive' | 'pending' | 'rejected';
  tenant_id: string | null;
  is_super_admin: boolean;
  password?: string;
  is_active: boolean;
}

const UsersManager: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [tenants, setTenants] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState<UserFormData>({
    first_name: '',
    last_name: '',
    email: '',
    role: 'user',
    status: 'active',
    tenant_id: null,
    is_super_admin: false,
    password: '',
    is_active: true
  });

  useEffect(() => {
    fetchUsers();
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const response = await api.get('/api/tenants');
      if (response.ok) {
        const data = await response.json();
        setTenants(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('[testing] Error fetching tenants:', error);
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        setMessage({ type: 'error', text: 'Failed to load users' });
      }
    } catch (error) {
      console.error('[testing] Error fetching users:', error);
      setMessage({ type: 'error', text: 'Failed to load users' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsEditing(false);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      role: 'user',
      status: 'active',
      tenant_id: null,
      is_super_admin: false,
      password: '',
      is_active: true
    });
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditing(true);
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      status: user.status,
      tenant_id: user.tenant_id,
      is_super_admin: user.is_super_admin,
      password: '',
      is_active: user.is_active
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const url = isEditing ? `/api/users/${selectedUser?.id}` : '/api/users';
      
      const payload = { ...formData };
      if (isEditing && !payload.password) {
        delete payload.password; // Don't send empty password on edit
      }

      const response = isEditing 
        ? await api.put(url, payload)
        : await api.post(url, payload);

      if (response.ok) {
        await fetchUsers();
        setIsModalOpen(false);
        setMessage({ 
          type: 'success', 
          text: isEditing ? 'User updated successfully' : 'User created successfully' 
        });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Failed to save user' });
      }
    } catch (error) {
      console.error('[testing] Error saving user:', error);
      setMessage({ type: 'error', text: 'Failed to save user' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser?.id) {
      setMessage({ type: 'error', text: 'You cannot delete your own account' });
      return;
    }

    try {
      const response = await api.delete(`/api/users/${userId}`);

      if (response.ok) {
        await fetchUsers();
        setMessage({ type: 'success', text: 'User deleted successfully' });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Failed to delete user' });
      }
    } catch (error) {
      console.error('[testing] Error deleting user:', error);
      setMessage({ type: 'error', text: 'Failed to delete user' });
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      const response = await api.put(`/api/users/${userId}/approve`, {
        approved_by: currentUser?.id
      });

      if (response.ok) {
        await fetchUsers();
        setMessage({ type: 'success', text: 'User approved successfully' });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Failed to approve user' });
      }
    } catch (error) {
      console.error('[testing] Error approving user:', error);
      setMessage({ type: 'error', text: 'Failed to approve user' });
    }
  };

  const handleRejectUser = async (userId: string) => {
    try {
      const response = await api.put(`/api/users/${userId}/reject`, {
        rejected_by: currentUser?.id,
        reason: 'Rejected by admin'
      });

      if (response.ok) {
        await fetchUsers();
        setMessage({ type: 'success', text: 'User rejected successfully' });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Failed to reject user' });
      }
    } catch (error) {
      console.error('[testing] Error rejecting user:', error);
      setMessage({ type: 'error', text: 'Failed to reject user' });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'editor':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'user':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-3 w-3" />;
      case 'inactive':
        return <X className="h-3 w-3" />;
      case 'pending':
        return <Clock className="h-3 w-3" />;
      case 'rejected':
        return <UserX className="h-3 w-3" />;
      default:
        return <AlertCircle className="h-3 w-3" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-SG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredUsers = users.filter(user =>
    user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if current user is admin
  const isAdmin = currentUser?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-lg border border-border shadow-sm p-6">
        <div className="text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You need administrator privileges to manage users.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brandPurple"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Flowbite Style */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Users Management</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Manage user accounts, roles, and permissions
                </p>
              </div>
            </div>
            <button
              onClick={handleCreateUser}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {/* Message - Flowbite Alert Style */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`border-b ${
                message.type === 'success' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="p-4 flex items-start gap-2">
                {message.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <p className={`text-sm font-medium ${
                    message.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {message.text}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search - Flowbite Input Style */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Users Table - Flowbite Table Style */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3 font-semibold">
                  User
                </th>
                <th className="px-6 py-3 font-semibold">
                  Role
                </th>
                <th className="px-6 py-3 font-semibold">
                  Status
                </th>
                <th className="px-6 py-3 font-semibold">
                  Tenant
                </th>
                <th className="px-6 py-3 font-semibold">
                  Last Login
                </th>
                <th className="px-6 py-3 font-semibold">
                  Created
                </th>
                <th className="px-6 py-3 text-right font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t border-gray-200 transition-colors hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadgeColor(user.status)}`}>
                        {getStatusIcon(user.status)}
                        <span>{user.status.charAt(0).toUpperCase() + user.status.slice(1)}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.is_super_admin ? (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                        Super Admin
                      </span>
                    ) : (
                      <span className="text-sm text-gray-600">
                        {tenants?.find(t => t.id === user.tenant_id)?.name || 'Not Assigned'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.last_login ? (
                      <div className="flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        {formatDate(user.last_login)}
                      </div>
                    ) : (
                      'Never'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(user.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {/* Approval actions for pending users */}
                      {user.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveUser(user.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Approve user"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRejectUser(user.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Reject user"
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      
                      {/* Standard edit action */}
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-2 text-brandPurple hover:bg-brandPurple/10 rounded-lg transition-colors"
                        title="Edit user"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      {/* Delete action (not for own account) */}
                      {user.id !== currentUser?.id && (
                        <button
                          onClick={() => setDeleteConfirm(user.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No users found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first user.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* User Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">
                    {isEditing ? 'Edit User' : 'Create New User'}
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-secondary rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-brandPurple focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-brandPurple focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-brandPurple focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'admin' | 'editor' | 'user' }))}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-brandPurple focus:border-transparent"
                    >
                      <option value="user">User</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' | 'pending' | 'rejected' }))}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-brandPurple focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {isEditing ? 'New Password (leave blank to keep current)' : 'Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-border rounded-lg focus:ring-2 focus:ring-brandPurple focus:border-transparent"
                      required={!isEditing}
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {!isEditing && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Must be at least 8 characters long
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tenant Assignment
                  </label>
                  <select
                    value={formData.tenant_id || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, tenant_id: e.target.value || null }))}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-brandPurple focus:border-transparent"
                    disabled={formData.is_super_admin}
                  >
                    <option value="">Select Tenant</option>
                    {tenants?.map(tenant => (
                      <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                    )) || []}
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_super_admin"
                    checked={formData.is_super_admin}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      is_super_admin: e.target.checked,
                      tenant_id: e.target.checked ? null : prev.tenant_id 
                    }))}
                    className="h-4 w-4 text-brandPurple focus:ring-brandPurple border-border rounded"
                  />
                  <label htmlFor="is_super_admin" className="ml-2 text-sm text-foreground">
                    Super Admin (can access all tenants)
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="h-4 w-4 text-brandPurple focus:ring-brandPurple border-border rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 text-sm text-foreground">
                    Active user
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center space-x-2 px-4 py-2 bg-brandPurple text-white rounded-lg hover:bg-brandPurple/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    <span>{saving ? 'Saving...' : (isEditing ? 'Update User' : 'Create User')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Delete User</h3>
                    <p className="text-sm text-muted-foreground">
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
                <p className="text-sm text-foreground mb-6">
                  Are you sure you want to delete this user? They will lose access to the system immediately.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleDeleteUser(deleteConfirm)}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete User</span>
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2 text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UsersManager;
