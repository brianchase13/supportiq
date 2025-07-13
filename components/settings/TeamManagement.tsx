'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  UserPlus, 
  Settings, 
  Mail, 
  Shield, 
  Trash2,
  Edit,
  Check,
  X,
  Crown,
  User,
  Eye,
  EyeOff
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'agent' | 'viewer';
  status: 'active' | 'pending' | 'inactive';
  avatar?: string;
  joinedAt: string;
  lastActive?: string;
  permissions: string[];
}

interface Invitation {
  id: string;
  email: string;
  role: 'admin' | 'agent' | 'viewer';
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
}

export function TeamManagement() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [editingMember, setEditingMember] = useState<string | null>(null);
  
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'agent' as const
  });

  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockMembers: TeamMember[] = [
        {
          id: '1',
          name: 'Sarah Chen',
          email: 'sarah@company.com',
          role: 'owner',
          status: 'active',
          avatar: '/avatars/sarah.jpg',
          joinedAt: '2024-01-15',
          lastActive: '2024-12-19T10:30:00Z',
          permissions: ['all']
        },
        {
          id: '2',
          name: 'Mike Rodriguez',
          email: 'mike@company.com',
          role: 'admin',
          status: 'active',
          avatar: '/avatars/mike.jpg',
          joinedAt: '2024-02-01',
          lastActive: '2024-12-19T09:15:00Z',
          permissions: ['manage_team', 'view_analytics', 'manage_settings']
        },
        {
          id: '3',
          name: 'Emma Thompson',
          email: 'emma@company.com',
          role: 'agent',
          status: 'active',
          avatar: '/avatars/emma.jpg',
          joinedAt: '2024-03-10',
          lastActive: '2024-12-19T08:45:00Z',
          permissions: ['view_tickets', 'respond_tickets']
        },
        {
          id: '4',
          name: 'Alex Johnson',
          email: 'alex@company.com',
          role: 'viewer',
          status: 'pending',
          joinedAt: '2024-12-18',
          permissions: ['view_analytics']
        }
      ];

      const mockInvitations: Invitation[] = [
        {
          id: '1',
          email: 'jessica@company.com',
          role: 'agent',
          invitedBy: 'Sarah Chen',
          invitedAt: '2024-12-19T10:00:00Z',
          expiresAt: '2024-12-26T10:00:00Z'
        }
      ];

      setMembers(mockMembers);
      setInvitations(mockInvitations);
    } catch (error) {
      console.error('Error loading team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: TeamMember['role']) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-600" />;
      case 'agent':
        return <User className="w-4 h-4 text-green-600" />;
      case 'viewer':
        return <Eye className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: TeamMember['role']) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'agent':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'viewer':
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: TeamMember['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
    }
  };

  const handleInvite = async () => {
    if (!inviteData.email || !inviteData.role) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newInvitation: Invitation = {
        id: Date.now().toString(),
        email: inviteData.email,
        role: inviteData.role,
        invitedBy: 'Sarah Chen',
        invitedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      setInvitations(prev => [...prev, newInvitation]);
      setInviteData({ email: '', role: 'agent' });
      setShowInviteForm(false);
    } catch (error) {
      console.error('Error sending invitation:', error);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: TeamMember['role']) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setMembers(prev => prev.map(member => 
        member.id === memberId ? { ...member, role: newRole } : member
      ));
      setEditingMember(null);
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setMembers(prev => prev.filter(member => member.id !== memberId));
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Invitation resent successfully!');
    } catch (error) {
      console.error('Error resending invitation:', error);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!confirm('Are you sure you want to cancel this invitation?')) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    } catch (error) {
      console.error('Error canceling invitation:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading team data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Users className="w-6 h-6 text-blue-600" />
                Team Management
              </CardTitle>
              <CardDescription>
                Manage team members, roles, and permissions
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowInviteForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Member
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Team Members */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Team Members ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{member.name}</h4>
                    {getRoleIcon(member.role)}
                    <Badge className={getRoleColor(member.role)}>
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </Badge>
                    <Badge variant="secondary" className={getStatusColor(member.status)}>
                      {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{member.email}</p>
                  <p className="text-xs text-gray-500">
                    Joined {new Date(member.joinedAt).toLocaleDateString()}
                    {member.lastActive && ` • Last active ${new Date(member.lastActive).toLocaleDateString()}`}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {editingMember === member.id ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={member.role}
                        onChange={(e) => handleUpdateRole(member.id, e.target.value as TeamMember['role'])}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="admin">Admin</option>
                        <option value="agent">Agent</option>
                        <option value="viewer">Viewer</option>
                      </select>
                      <Button size="sm" variant="outline" onClick={() => setEditingMember(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingMember(member.id)}
                        disabled={member.role === 'owner'}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {member.role !== 'owner' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-orange-600" />
              Pending Invitations ({invitations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center gap-4 p-4 border rounded-lg bg-orange-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{invitation.email}</h4>
                      <Badge className={getRoleColor(invitation.role)}>
                        {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Invited by {invitation.invitedBy} on {new Date(invitation.invitedAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-orange-600">
                      Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResendInvitation(invitation.id)}
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      Resend
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancelInvitation(invitation.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invite Form */}
      {showInviteForm && (
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-green-600" />
              Invite Team Member
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="colleague@company.com"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  value={inviteData.role}
                  onChange={(e) => setInviteData(prev => ({ ...prev, role: e.target.value as any }))}
                  className="mt-1 w-full border rounded-md px-3 py-2"
                >
                  <option value="admin">Admin - Full access to manage team and settings</option>
                  <option value="agent">Agent - Can respond to tickets and view analytics</option>
                  <option value="viewer">Viewer - Can only view analytics and reports</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleInvite} className="bg-green-600 hover:bg-green-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Send Invitation
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowInviteForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Role Permissions */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            Role Permissions
          </CardTitle>
          <CardDescription>
            Overview of what each role can do
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-5 h-5 text-yellow-600" />
                <h4 className="font-semibold">Owner</h4>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• All permissions</li>
                <li>• Manage billing</li>
                <li>• Delete account</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold">Admin</h4>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Manage team members</li>
                <li>• Configure settings</li>
                <li>• View all analytics</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold">Agent</h4>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Respond to tickets</li>
                <li>• View assigned tickets</li>
                <li>• Access basic analytics</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-5 h-5 text-gray-600" />
                <h4 className="font-semibold">Viewer</h4>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• View analytics</li>
                <li>• Read-only access</li>
                <li>• Export reports</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 