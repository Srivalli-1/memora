import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, Plus, Trash2, Edit2, Lock, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import DeleteConfirmModal from '../components/common/DeleteConfirmModal';
import { formatDate, formatFullDate } from '../utils/formatters';

const CommitmentsPage = () => {
  const { user } = useAuth();
  const [commitments, setCommitments] = useState([]);
  const [selectedCommitment, setSelectedCommitment] = useState(null);
  const [loading, setLoading] = useState(true);

  // New Commitment Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    promiseText: ''
  });
  const [userQuery, setUserQuery] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Edit Commitment Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    promiseText: ''
  });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete Confirm Modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Sign State
  const [signingLoading, setSigningLoading] = useState(false);

  const fetchCommitments = async (keepSelectedId = null) => {
    try {
      setLoading(true);
      const res = await api.get('/commitments');
      if (res.data?.success) {
        const list = res.data.commitments || [];
        setCommitments(list);
        if (keepSelectedId) {
          const found = list.find((c) => c.id === keepSelectedId);
          setSelectedCommitment(found || list[0] || null);
        } else if (list.length > 0 && (!selectedCommitment || !list.some((c) => c.id === selectedCommitment.id))) {
          setSelectedCommitment(list[0]);
        } else if (list.length === 0) {
          setSelectedCommitment(null);
        }
      }
    } catch (err) {
      console.error('Failed to load commitments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommitments();
  }, []);

  const searchUsers = async (query) => {
    setUserQuery(query);
    if (query.trim().length < 2) {
      setUserResults([]);
      return;
    }
    try {
      const res = await api.get(`/auth/users/search?q=${query.trim()}`);
      if (res.data?.success) {
        setUserResults(res.data.users || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCommitment = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim() || !formData.promiseText.trim()) {
      setFormError('Please provide a title and mutual agreement promise.');
      return;
    }

    try {
      setSubmitting(true);
      const partnerIds = selectedPartner ? [selectedPartner.id] : [];
      const res = await api.post('/commitments', {
        title: formData.title.trim(),
        promiseText: formData.promiseText.trim(),
        participantIds: partnerIds
      });

      if (res.data?.success) {
        const created = res.data.commitment;
        setIsModalOpen(false);
        setFormData({ title: '', promiseText: '' });
        setSelectedPartner(null);
        await fetchCommitments(created?.id);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to forge agreement.');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (commitment) => {
    setEditFormData({
      title: commitment.title || '',
      promiseText: commitment.promiseText || ''
    });
    setEditError('');
    setIsEditModalOpen(true);
  };

  const handleUpdateCommitment = async (e) => {
    e.preventDefault();
    if (!selectedCommitment) return;
    setEditError('');

    if (!editFormData.title.trim() || !editFormData.promiseText.trim()) {
      setEditError('Title and agreement promise text are required.');
      return;
    }

    try {
      setEditSubmitting(true);
      const res = await api.put(`/commitments/${selectedCommitment.id}`, {
        title: editFormData.title.trim(),
        promiseText: editFormData.promiseText.trim()
      });

      if (res.data?.success) {
        const updated = res.data.commitment;
        setSelectedCommitment(updated);
        setCommitments((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        );
        setIsEditModalOpen(false);
      }
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update agreement.');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleSignAgreement = async () => {
    if (!selectedCommitment) return;
    try {
      setSigningLoading(true);
      const res = await api.post(`/commitments/${selectedCommitment.id}/sign`, {
        action: 'ACCEPT',
        signatureNotes: 'Signed with love'
      });
      if (res.data?.success) {
        await fetchCommitments(selectedCommitment.id);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error signing agreement.');
    } finally {
      setSigningLoading(false);
    }
  };

  const handleDeleteCommitment = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.delete(`/commitments/${deleteTarget.id}`);
      setCommitments((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      if (selectedCommitment?.id === deleteTarget.id) {
        setSelectedCommitment(null);
      }
      setDeleteTarget(null);
      await fetchCommitments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete commitment.');
    } finally {
      setDeleting(false);
    }
  };

  // Fallback sample agreement matching Panel 5 if empty
  const displayCommitment = selectedCommitment || (commitments.length > 0 ? commitments[0] : {
    id: 'sample',
    title: 'Always be honest',
    promiseText:
      'We promise to always be there for each other, communicate honestly, support each other\'s dreams, and never give up on us.',
    createdAt: new Date('2026-09-04'),
    status: 'ACTIVE',
    creator: { fullName: 'Valli', id: user?.id },
    creatorId: user?.id,
    participants: [
      { id: 'p1', user: { fullName: 'Valli' }, status: 'ACCEPTED', userId: user?.id },
      { id: 'p2', user: { fullName: 'Arjun' }, status: 'ACCEPTED', userId: 'arjun' }
    ]
  });

  const isCreator = displayCommitment.creatorId === user?.id || displayCommitment.creator?.id === user?.id;
  const isLocked =
    displayCommitment.status === 'ACTIVE' ||
    (displayCommitment.participants &&
      displayCommitment.participants.length > 1 &&
      displayCommitment.participants.every((p) => p.status === 'ACCEPTED'));

  // User's own participant record
  const myParticipantRecord = displayCommitment.participants?.find(
    (p) => p.userId === user?.id
  );
  const hasUserSigned = myParticipantRecord?.status === 'ACCEPTED';
  const isRealCommitment = commitments.some((c) => c.id === displayCommitment.id);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2c1810]">
          Mutual Commitments
        </h1>
        <p className="text-xs sm:text-sm text-[#705645] font-serif">
          Pacts and promises bound by love <span className="text-[#c86d74]">♡</span>
        </p>
      </div>

      {/* Main Layout: Left Archive / Right Physical Parchment Spread */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Pacts List (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
            className="w-full shadow-xs"
          >
            Forge New Agreement
          </Button>

          <div className="space-y-3">
            {commitments.length === 0 ? (
              <div className="p-6 rounded-2xl warm-card border border-[#e8dfd1] text-center text-xs text-[#806958] font-serif">
                No forged agreements yet. Click above to seal your first shared promise ♡
              </div>
            ) : (
              commitments.map((c) => {
                const isSelected = displayCommitment.id === c.id;
                const cLocked =
                  c.status === 'ACTIVE' ||
                  (c.participants?.length > 1 && c.participants.every((p) => p.status === 'ACCEPTED'));

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCommitment(c)}
                    className={`p-4 rounded-2xl transition cursor-pointer border relative group ${
                      isSelected
                        ? 'bg-[#fbeeed] border-[#f4cfd3] shadow-xs'
                        : 'warm-card border-[#e8dfd1] hover:border-[#f4cfd3]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">💍</span>
                          <h4 className="text-sm font-serif font-bold text-[#2c1810] truncate">
                            {c.title}
                          </h4>
                        </div>

                        <p className="text-xs text-[#705645] font-serif line-clamp-1 italic">
                          "{c.promiseText}"
                        </p>

                        <div className="text-[11px] text-[#806958] font-serif pt-1 flex items-center gap-2">
                          <span>{formatDate(c.createdAt)}</span>
                          {cLocked ? (
                            <span className="inline-flex items-center gap-0.5 text-[#3e6840] font-semibold">
                              <CheckCircle2 className="w-3 h-3" /> Bound
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 text-[#b06020] font-semibold">
                              <Clock className="w-3 h-3" /> Pending
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Delete button (creator only) */}
                      {(c.creatorId === user?.id || c.creator?.id === user?.id) && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(c);
                          }}
                          className="p-1 rounded-lg text-[#806958] hover:text-[#a8323e] hover:bg-white/60 transition opacity-0 group-hover:opacity-100"
                          title="Delete Commitment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Physical Parchment Certificate with Red Wax Seal (8 Cols) */}
        <div className="lg:col-span-8">
          <div className="relative shadow-2xl rounded-2xl max-w-xl mx-auto">
            {/* Top Curled Scroll Roll */}
            <div className="scroll-roll w-full" />

            {/* Main Parchment Certificate */}
            <div className="parchment-sheet p-8 sm:p-12 relative min-h-[580px] flex flex-col justify-between overflow-hidden shadow-paper">
              {/* Header: Centered Physical Crimson Wax Seal */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="wax-seal-badge select-none">
                    MEMORA
                  </div>
                  {/* Subtle shine on wax seal */}
                  <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-white/25 blur-[1px] pointer-events-none" />
                </div>

                <div className="text-center space-y-1">
                  <span className="text-[11px] uppercase tracking-widest text-[#7a6453] font-serif font-bold">
                    Official Mutual Pact
                  </span>
                  <h2 className="font-handwriting text-3xl sm:text-4xl font-bold text-[#3d2417] leading-tight">
                    {displayCommitment.title}
                  </h2>
                </div>
              </div>

              {/* Body: Handwritten Promise Statement */}
              <div className="my-8 px-2 sm:px-6 py-4 rounded-xl bg-[#faf3e3]/50 border border-[#eee0c5]/80 text-center">
                <p className="font-handwriting text-lg sm:text-xl text-[#4a2e1b] leading-relaxed italic">
                  "{displayCommitment.promiseText}"
                </p>
              </div>

              {/* Bottom Section: Co-Signatures & Wax Stamp */}
              <div className="space-y-6 pt-4 border-t border-[#ddcca8]/60">
                {/* Two Column Signatures */}
                <div className="grid grid-cols-2 gap-6 text-center">
                  {displayCommitment.participants && displayCommitment.participants.length > 0 ? (
                    displayCommitment.participants.map((p, idx) => {
                      const isSigned = p.status === 'ACCEPTED';
                      const pName = p.user?.fullName || (idx === 0 ? 'Valli' : 'Arjun');

                      return (
                        <div key={p.id || idx} className="space-y-1">
                          <div className="min-h-[44px] flex items-end justify-center">
                            {isSigned ? (
                              <p className="font-handwriting text-2xl font-bold text-[#2c1810] tracking-wide transform -rotate-2">
                                {pName} <span className="text-[#c86d74] text-lg">♡</span>
                              </p>
                            ) : (
                              <span className="text-xs font-serif text-[#9c8474] italic">
                                Awaiting signature...
                              </span>
                            )}
                          </div>
                          <div className="w-3/4 mx-auto border-b border-[#a89278]/70" />
                          <p className="text-[11px] font-serif font-bold text-[#5c3e2e] uppercase tracking-wider pt-0.5">
                            {pName}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <>
                      <div className="space-y-1">
                        <p className="font-handwriting text-2xl font-bold text-[#2c1810]">
                          {displayCommitment.creator?.fullName || user?.fullName || 'Valli'} ♡
                        </p>
                        <div className="w-3/4 mx-auto border-b border-[#a89278]/70" />
                        <p className="text-[11px] font-serif font-bold text-[#5c3e2e] uppercase tracking-wider">
                          Creator Signature
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-handwriting text-xl text-[#9c8474] italic">
                          Awaiting Partner...
                        </p>
                        <div className="w-3/4 mx-auto border-b border-[#a89278]/70" />
                        <p className="text-[11px] font-serif font-bold text-[#5c3e2e] uppercase tracking-wider">
                          Partner Signature
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Status & Action Bar */}
                <div className="flex items-center justify-between pt-3 border-t border-[#ddcca8]/40 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    {isLocked ? (
                      <span className="inline-flex items-center gap-1 text-xs text-[#3e6840] bg-[#eef7ee] px-3 py-1 rounded-full border border-[#cfe8cf] font-semibold">
                        <Lock className="w-3.5 h-3.5 text-[#3e6840]" /> Co-signed & Permanently Locked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-[#b06020] bg-[#fff6eb] px-3 py-1 rounded-full border border-[#fed7aa] font-semibold">
                        <Clock className="w-3.5 h-3.5" /> Pending Partner Signature
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Edit button (Creator only, before locked) */}
                    {isCreator && isRealCommitment && (
                      isLocked ? (
                        <span
                          title="This agreement is already co-signed and locked. It cannot be edited."
                          className="cursor-not-allowed opacity-50 inline-flex items-center gap-1 px-2.5 py-1 text-xs font-serif text-[#806958]"
                        >
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Edit2}
                          onClick={() => openEditModal(displayCommitment)}
                        >
                          Edit Agreement
                        </Button>
                      )
                    )}

                    {/* Sign Button if user has not signed yet */}
                    {isRealCommitment && myParticipantRecord && !hasUserSigned && (
                      <Button
                        variant="primary"
                        size="sm"
                        loading={signingLoading}
                        onClick={handleSignAgreement}
                      >
                        Sign My Name ✍️
                      </Button>
                    )}

                    {/* Delete button (creator only) */}
                    {isCreator && isRealCommitment && (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Trash2}
                        onClick={() => setDeleteTarget(displayCommitment)}
                        className="text-[#a8323e] hover:bg-[#fbeeed]"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Curled Scroll Roll */}
            <div className="scroll-roll w-full" />
          </div>
        </div>
      </div>

      {/* New Commitment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Forge a Mutual Commitment"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateCommitment} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-[#fbeeed] border border-[#f4cfd3] text-[#a8323e] text-xs font-semibold">
              {formError}
            </div>
          )}

          <Input
            label="Commitment Title"
            placeholder="e.g., Always be honest"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <Input
            label="Mutual Promise"
            isTextarea
            rows={5}
            placeholder="We promise to always be there for each other, communicate openly..."
            value={formData.promiseText}
            onChange={(e) => setFormData({ ...formData, promiseText: e.target.value })}
            required
          />

          {/* Partner Search */}
          <div className="space-y-1.5 relative">
            <label className="block text-xs font-semibold text-[#4a2e1b]">
              Invite Partner to Sign (Optional)
            </label>
            <Input
              placeholder="Search partner by username or email..."
              value={userQuery}
              onChange={(e) => searchUsers(e.target.value)}
            />
            {selectedPartner && (
              <div className="text-xs text-[#3e6840] font-semibold flex items-center gap-1.5 pt-1">
                <span>✓ Partner Selected:</span>
                <span className="font-bold">{selectedPartner.fullName}</span>
                <span className="text-[#806958]">(@{selectedPartner.username})</span>
              </div>
            )}
            {userResults.length > 0 && !selectedPartner && (
              <div className="absolute top-full left-0 right-0 z-20 bg-white border border-[#e8dfd1] rounded-xl shadow-xl mt-1 max-h-40 overflow-y-auto">
                {userResults.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => {
                      setSelectedPartner(u);
                      setUserQuery(`${u.fullName} (@${u.username})`);
                      setUserResults([]);
                    }}
                    className="p-2.5 hover:bg-[#faf4ec] cursor-pointer text-xs border-b border-[#f3ebde] last:border-b-0"
                  >
                    <div className="font-semibold text-[#2c1810]">{u.fullName}</div>
                    <div className="text-[11px] text-[#806958]">@{u.username} • {u.email}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={submitting}
            >
              Seal Agreement
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Commitment Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Mutual Agreement"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleUpdateCommitment} className="space-y-4">
          {editError && (
            <div className="p-3 rounded-xl bg-[#fbeeed] border border-[#f4cfd3] text-[#a8323e] text-xs font-semibold">
              {editError}
            </div>
          )}

          <Input
            label="Commitment Title"
            value={editFormData.title}
            onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
            required
          />

          <Input
            label="Mutual Promise"
            isTextarea
            rows={5}
            value={editFormData.promiseText}
            onChange={(e) => setEditFormData({ ...editFormData, promiseText: e.target.value })}
            required
          />

          <div className="pt-3 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={editSubmitting}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteCommitment}
        title="Delete Commitment?"
        message="Are you sure you want to delete this commitment? This mutual pact will be permanently removed."
        loading={deleting}
        confirmButtonText="Delete"
      />
    </div>
  );
};

export default CommitmentsPage;
