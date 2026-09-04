import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  Crown,
  UserPlus,
  UserMinus,
  DoorOpen,
  Sparkles,
  Search,
  X,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import DeleteConfirmModal from '../components/common/DeleteConfirmModal';
import { formatDate } from '../utils/formatters';

const SharedSpacesPage = () => {
  const { user } = useAuth();
  const [spaces, setSpaces] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected space for detail / members drawer
  const [activeSpace, setActiveSpace] = useState(null);

  // Create Space Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createData, setCreateData] = useState({ name: '', description: '' });
  const [createFile, setCreateFile] = useState(null);
  const [createPreview, setCreatePreview] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  // Edit Space Modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState({ name: '', description: '' });
  const [editFile, setEditFile] = useState(null);
  const [editPreview, setEditPreview] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Invite Member State
  const [inviteIdentifier, setInviteIdentifier] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMsg, setInviteMsg] = useState({ type: '', text: '' });

  // Delete Space Confirm Modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Remove Member Confirm Modal
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [removeMemberLoading, setRemoveMemberLoading] = useState(false);

  const fetchSpaces = async (keepActiveId = null) => {
    try {
      setLoading(true);
      const res = await api.get('/spaces');
      if (res.data?.success) {
        const list = res.data.spaces || [];
        setSpaces(list);
        setPendingInvitations(res.data.pendingInvitations || []);

        if (keepActiveId) {
          const detailRes = await api.get(`/spaces/${keepActiveId}`);
          if (detailRes.data?.success) {
            setActiveSpace(detailRes.data.space);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load shared spaces:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  const openSpaceDetails = async (spaceId) => {
    try {
      const res = await api.get(`/spaces/${spaceId}`);
      if (res.data?.success) {
        setActiveSpace(res.data.space);
        setInviteMsg({ type: '', text: '' });
        setInviteIdentifier('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to open space details.');
    }
  };

  const handleCreateSpace = async (e) => {
    e.preventDefault();
    setCreateError('');

    if (!createData.name.trim()) {
      setCreateError('Please give your space a name.');
      return;
    }

    try {
      setCreateLoading(true);
      const data = new FormData();
      data.append('name', createData.name.trim());
      if (createData.description.trim()) {
        data.append('description', createData.description.trim());
      }
      if (createFile) {
        data.append('coverImage', createFile);
      }

      const res = await api.post('/spaces', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success) {
        setIsCreateOpen(false);
        setCreateData({ name: '', description: '' });
        setCreateFile(null);
        setCreatePreview('');
        await fetchSpaces();
      }
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create shared space.');
    } finally {
      setCreateLoading(false);
    }
  };

  const openEditModal = (space) => {
    setEditData({
      name: space.name || '',
      description: space.description || ''
    });
    setEditFile(null);
    setEditPreview(space.coverImage || '');
    setEditError('');
    setIsEditOpen(true);
  };

  const handleUpdateSpace = async (e) => {
    e.preventDefault();
    if (!activeSpace) return;
    setEditError('');

    if (!editData.name.trim()) {
      setEditError('Space name is required.');
      return;
    }

    try {
      setEditLoading(true);
      const data = new FormData();
      data.append('name', editData.name.trim());
      data.append('description', editData.description.trim());
      if (editFile) {
        data.append('coverImage', editFile);
      }

      const res = await api.put(`/spaces/${activeSpace.id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success) {
        setIsEditOpen(false);
        await fetchSpaces(activeSpace.id);
      }
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update space.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteSpace = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.delete(`/spaces/${deleteTarget.id}`);
      if (activeSpace?.id === deleteTarget.id) {
        setActiveSpace(null);
      }
      setDeleteTarget(null);
      await fetchSpaces();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete space.');
    } finally {
      setDeleting(false);
    }
  };

  const handleInviteUser = async (e) => {
    e.preventDefault();
    if (!activeSpace || !inviteIdentifier.trim()) return;
    setInviteMsg({ type: '', text: '' });

    try {
      setInviteLoading(true);
      const res = await api.post(`/spaces/${activeSpace.id}/invite`, {
        inviteeIdentifier: inviteIdentifier.trim()
      });
      if (res.data?.success) {
        setInviteMsg({ type: 'success', text: res.data.message || 'Invitation sent!' });
        setInviteIdentifier('');
      }
    } catch (err) {
      setInviteMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to send invitation.'
      });
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRespondInvitation = async (invitationId, action) => {
    try {
      await api.post(`/spaces/invitations/${invitationId}/respond`, { action });
      await fetchSpaces();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to respond to invitation.');
    }
  };

  const handleRemoveMember = async () => {
    if (!activeSpace || !memberToRemove) return;
    try {
      setRemoveMemberLoading(true);
      await api.delete(`/spaces/${activeSpace.id}/members/${memberToRemove.userId}`);
      setMemberToRemove(null);

      if (memberToRemove.userId === user?.id) {
        // Self-left space
        setActiveSpace(null);
      } else {
        await openSpaceDetails(activeSpace.id);
      }
      await fetchSpaces();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member.');
    } finally {
      setRemoveMemberLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eee4d6] pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2c1810] flex items-center gap-2">
            <span>Shared Spaces</span>
            <span className="text-2xl">🌟</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#705645] font-serif mt-1">
            Personal sanctuaries shared with the ones you love <span className="text-[#c86d74]">♡</span>
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setIsCreateOpen(true)}
          className="shadow-sm"
        >
          Create Shared Space
        </Button>
      </div>

      {/* Pending Invitations Banner (if any) */}
      {pendingInvitations.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#fff8ea] border border-[#f5dfb8] space-y-3">
          <h4 className="text-xs font-serif font-bold uppercase tracking-wider text-[#8a5d1b] flex items-center gap-1.5">
            <span>💌</span> Pending Space Invitations ({pendingInvitations.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingInvitations.map((inv) => (
              <div
                key={inv.id}
                className="p-3.5 bg-white/80 rounded-xl border border-[#ebd8bc] flex items-center justify-between gap-3 shadow-xs"
              >
                <div>
                  <h5 className="text-sm font-serif font-bold text-[#2c1810]">
                    {inv.sharedSpace?.name}
                  </h5>
                  <p className="text-xs text-[#806958] font-serif">
                    Invited by {inv.inviter?.fullName} (@{inv.inviter?.username})
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleRespondInvitation(inv.id, 'ACCEPT')}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRespondInvitation(inv.id, 'DECLINE')}
                  >
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spaces Grid */}
      {loading ? (
        <div className="py-16 text-center text-sm font-serif text-[#806958]">
          Opening your shared sanctuaries...
        </div>
      ) : spaces.length === 0 ? (
        <div className="py-16 text-center space-y-4 p-8 rounded-3xl warm-card border border-[#e8dfd1]">
          <div className="text-4xl">🏡✨</div>
          <h3 className="text-base font-serif font-bold text-[#2c1810]">
            No Shared Spaces Yet
          </h3>
          <p className="text-xs text-[#806958] font-serif max-w-md mx-auto">
            Create a private shared room where you and your partner or loved one can co-write memories, sign pacts, and pin milestones together.
          </p>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsCreateOpen(true)}
          >
            Create Your First Space
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spaces.map((space) => {
            const isOwner = space.userRole === 'OWNER' || space.ownerId === user?.id;

            return (
              <div
                key={space.id}
                className="group p-5 rounded-3xl warm-card border border-[#e8dfd1] hover:border-[#e89da2] shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Space Cover Header */}
                  {space.coverImage ? (
                    <div className="h-32 rounded-2xl overflow-hidden border border-[#eee4d6]">
                      <img
                        src={space.coverImage}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                  ) : (
                    <div className="h-24 rounded-2xl bg-linear-to-br from-[#faf3e8] to-[#f4e4e6] border border-[#eee4d6] flex items-center justify-center text-3xl">
                      🌸🏡
                    </div>
                  )}

                  {/* Title & Role Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-serif font-bold text-[#2c1810] group-hover:text-[#c86d74] transition">
                      {space.name}
                    </h3>
                    {isOwner ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#b06020] bg-[#fff4e5] px-2 py-0.5 rounded-full border border-[#fed7aa]">
                        <Crown className="w-3 h-3" /> Owner
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#5c3e2e] bg-[#faf4ec] px-2 py-0.5 rounded-full border border-[#eee4d6]">
                        <Users className="w-3 h-3" /> Member
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#705645] font-serif italic line-clamp-2">
                    {space.description || 'A tender sanctuary shared between souls.'}
                  </p>
                </div>

                {/* Bottom Stats & Actions */}
                <div className="pt-4 mt-4 border-t border-[#eee4d6] flex items-center justify-between">
                  <span className="text-[11px] text-[#806958] font-serif flex items-center gap-1">
                    <Users className="w-3 h-3 text-[#c86d74]" />
                    <span>{space.members?.length || space._count?.members || 1} members</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(space)}
                        className="p-1.5 rounded-lg text-[#806958] hover:text-[#a8323e] hover:bg-[#fbeeed] transition"
                        title="Delete Space"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => openSpaceDetails(space.id)}
                      className="text-xs px-3 py-1.5"
                    >
                      Enter Space →
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Space Detail & Members Management Modal */}
      {activeSpace && (
        <Modal
          isOpen={Boolean(activeSpace)}
          onClose={() => setActiveSpace(null)}
          title={activeSpace.name}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6">
            {/* Space Header Info */}
            <div className="space-y-2 p-4 rounded-2xl bg-[#faf3e8]/70 border border-[#ebd8bc]">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-serif text-[#806958]">
                  Created by <strong className="text-[#2c1810]">{activeSpace.owner?.fullName}</strong>
                </span>
                {activeSpace.ownerId === user?.id && (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Edit2}
                    onClick={() => openEditModal(activeSpace)}
                  >
                    Edit Space
                  </Button>
                )}
              </div>
              {activeSpace.description && (
                <p className="text-xs text-[#5c3e2e] font-serif italic pt-1">
                  "{activeSpace.description}"
                </p>
              )}
            </div>

            {/* Members Section */}
            <div className="space-y-3">
              <h4 className="text-sm font-serif font-bold text-[#2c1810] flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#c86d74]" />
                <span>Space Members ({activeSpace.members?.length || 0})</span>
              </h4>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {activeSpace.members?.map((m) => {
                  const isSpaceOwner = activeSpace.ownerId === user?.id;
                  const isThisMemberOwner = m.role === 'OWNER' || m.userId === activeSpace.ownerId;
                  const isSelf = m.userId === user?.id;

                  return (
                    <div
                      key={m.id || m.userId}
                      className="p-3 rounded-xl bg-white border border-[#eee4d6] flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#fbeeed] flex items-center justify-center text-xs font-bold text-[#c86d74]">
                          {m.user?.fullName?.charAt(0) || 'M'}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[#2c1810]">
                            {m.user?.fullName} {isSelf && <span className="text-[#806958] font-normal">(You)</span>}
                          </p>
                          <p className="text-[10px] text-[#806958]">@{m.user?.username}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isThisMemberOwner ? (
                          <span className="text-[10px] font-bold text-[#b06020] bg-[#fff4e5] px-2 py-0.5 rounded-full border border-[#fed7aa]">
                            Owner
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#806958] bg-[#faf4ec] px-2 py-0.5 rounded-full">
                            Member
                          </span>
                        )}

                        {/* Owner removing someone, or member leaving */}
                        {((isSpaceOwner && !isThisMemberOwner) || (!isSpaceOwner && isSelf)) && (
                          <button
                            type="button"
                            onClick={() => setMemberToRemove(m)}
                            className="p-1 rounded-md text-[#a89080] hover:text-[#a8323e] hover:bg-[#fbeeed] transition text-xs"
                            title={isSelf ? 'Leave Space' : 'Remove Member'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Invite User Form */}
            <div className="space-y-3 pt-2 border-t border-[#eee4d6]">
              <h4 className="text-xs font-serif font-bold uppercase tracking-wider text-[#5c3e2e] flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5 text-[#c86d74]" />
                <span>Invite Loved One to this Space</span>
              </h4>

              {inviteMsg.text && (
                <div
                  className={`p-2.5 rounded-xl text-xs font-semibold ${
                    inviteMsg.type === 'success'
                      ? 'bg-[#eef7ee] border border-[#cfe8cf] text-[#2e6930]'
                      : 'bg-[#fbeeed] border border-[#f4cfd3] text-[#a8323e]'
                  }`}
                >
                  {inviteMsg.text}
                </div>
              )}

              <form onSubmit={handleInviteUser} className="flex gap-2">
                <Input
                  placeholder="Enter username or email..."
                  value={inviteIdentifier}
                  onChange={(e) => setInviteIdentifier(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={inviteLoading}
                  className="shrink-0"
                >
                  Send Invite
                </Button>
              </form>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end pt-3 border-t border-[#eee4d6]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveSpace(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Space Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create a Shared Sanctuary"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateSpace} className="space-y-4">
          {createError && (
            <div className="p-3 rounded-xl bg-[#fbeeed] border border-[#f4cfd3] text-[#a8323e] text-xs font-semibold">
              {createError}
            </div>
          )}

          <Input
            label="Space Name"
            placeholder="e.g., Our Little Haven"
            value={createData.name}
            onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
            required
          />

          <Input
            label="Description (Optional)"
            isTextarea
            rows={3}
            placeholder="A private sanctuary for our cherished memories..."
            value={createData.description}
            onChange={(e) => setCreateData({ ...createData, description: e.target.value })}
          />

          <div>
            <label className="block text-xs font-semibold text-[#4a2e1b] mb-1.5">
              Cover Image (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setCreateFile(e.target.files[0]);
                  setCreatePreview(URL.createObjectURL(e.target.files[0]));
                }
              }}
              className="w-full text-xs text-[#4a2e1b] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#fbeeed] file:text-[#c86d74] hover:file:bg-[#f7d8dc] cursor-pointer"
            />
            {createPreview && (
              <div className="mt-2.5 h-24 rounded-xl overflow-hidden border border-[#e8dfd1]">
                <img src={createPreview} alt="" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="pt-3 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={createLoading}
            >
              Create Sanctuary
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Space Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Shared Space"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleUpdateSpace} className="space-y-4">
          {editError && (
            <div className="p-3 rounded-xl bg-[#fbeeed] border border-[#f4cfd3] text-[#a8323e] text-xs font-semibold">
              {editError}
            </div>
          )}

          <Input
            label="Space Name"
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            required
          />

          <Input
            label="Description"
            isTextarea
            rows={3}
            value={editData.description}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
          />

          <div>
            <label className="block text-xs font-semibold text-[#4a2e1b] mb-1.5">
              Change Cover Image (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setEditFile(e.target.files[0]);
                  setEditPreview(URL.createObjectURL(e.target.files[0]));
                }
              }}
              className="w-full text-xs text-[#4a2e1b] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#fbeeed] file:text-[#c86d74] hover:file:bg-[#f7d8dc] cursor-pointer"
            />
            {editPreview && (
              <div className="mt-2.5 h-24 rounded-xl overflow-hidden border border-[#e8dfd1]">
                <img src={editPreview} alt="" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="pt-3 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsEditOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={editLoading}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Space Confirm Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteSpace}
        title="Delete Shared Space?"
        message="Are you sure you want to delete this shared space? This space and its shared associations will be permanently removed."
        loading={deleting}
        confirmButtonText="Delete"
      />

      {/* Remove Member Confirm Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(memberToRemove)}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleRemoveMember}
        title={memberToRemove?.userId === user?.id ? 'Leave Space?' : 'Remove Member?'}
        message={
          memberToRemove?.userId === user?.id
            ? 'Are you sure you want to leave this space?'
            : `Are you sure you want to remove ${memberToRemove?.user?.fullName} from this space?`
        }
        loading={removeMemberLoading}
        confirmButtonText={memberToRemove?.userId === user?.id ? 'Leave' : 'Remove'}
      />
    </div>
  );
};

export default SharedSpacesPage;
