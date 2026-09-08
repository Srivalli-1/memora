import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Plus,
  Lock,
  Sparkles,
  Send,
  Edit2,
  Trash2,
  Calendar,
  AlertCircle,
  Mail
} from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import DeleteConfirmModal from '../components/common/DeleteConfirmModal';
import { formatFullDate } from '../utils/formatters';
import lettersBg from '../assets/letters-bg.png';

const LettersPage = () => {
  const { user } = useAuth();
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);

  // View state: 'ARCHIVE' | 'READ' | 'COMPOSE'
  const [viewMode, setViewMode] = useState('ARCHIVE');
  const [activeLetter, setActiveLetter] = useState(null);

  // Compose Form State
  const [letterType, setLetterType] = useState('MYSELF'); // 'MYSELF', 'USER', 'FUTURE'
  const [subject, setSubject] = useState('Read this when you feel lost...');
  const [content, setContent] = useState(
    "Hey,\n\nIt's okay to feel overwhelmed. You are stronger than you think. This is just a phase, not the end. Keep going, you have so much to look forward to.\n\nWith love,\n" +
      (user?.fullName || 'Valli') +
      ' ♡'
  );
  const [unlockDate, setUnlockDate] = useState('');
  const [recipientQuery, setRecipientQuery] = useState('');
  const [recipientResults, setRecipientResults] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Edit Letter Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    content: '',
    unlockDate: ''
  });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete Confirm Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchLetters = async () => {
    try {
      setLoading(true);
      const res = await api.get('/letters');
      if (res.data?.success) {
        const list = res.data.letters || [];
        setLetters(list);
        return list;
      }
    } catch (err) {
      console.error('Failed to load letters:', err);
    } finally {
      setLoading(false);
    }
    return [];
  };

  useEffect(() => {
    fetchLetters();
  }, []);

  const searchUsers = async (query) => {
    setRecipientQuery(query);
    if (query.trim().length < 2) {
      setRecipientResults([]);
      return;
    }
    try {
      const res = await api.get(`/auth/users/search?q=${query.trim()}`);
      if (res.data?.success) {
        setRecipientResults(res.data.users || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateLetter = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!subject.trim() || !content.trim()) {
      setErrorMsg('Please enter a subject and letter content.');
      return;
    }

    if (letterType === 'USER' && !selectedRecipient) {
      setErrorMsg('Please select a recipient for your letter.');
      return;
    }

    if (letterType === 'FUTURE' && !unlockDate) {
      setErrorMsg('Please choose an unlock date for your time capsule.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/letters', {
        title: subject.trim(),
        content: content.trim(),
        letterType,
        recipientId: selectedRecipient?.id || null,
        unlockDate: unlockDate || null
      });

      if (res.data?.success) {
        const created = res.data.letter;
        setSuccessMsg('Letter created and sealed beautifully into your archive!');
        const updatedList = await fetchLetters();

        // Reset form
        setSubject('');
        setContent('');
        setSelectedRecipient(null);
        setUnlockDate('');

        // Switch to reading view of the newly sealed letter
        if (created) {
          setActiveLetter(created);
          setViewMode('READ');
        } else if (updatedList && updatedList.length > 0) {
          setActiveLetter(updatedList[0]);
          setViewMode('READ');
        } else {
          setViewMode('ARCHIVE');
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create letter.');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (ltr) => {
    setEditFormData({
      title: ltr.title || '',
      content: ltr.content || '',
      unlockDate: ltr.unlockDate ? new Date(ltr.unlockDate).toISOString().split('T')[0] : ''
    });
    setEditError('');
    setIsEditModalOpen(true);
  };

  const handleUpdateLetter = async (e) => {
    e.preventDefault();
    if (!activeLetter) return;
    setEditError('');

    if (!editFormData.title.trim() || !editFormData.content.trim()) {
      setEditError('Title and content are required.');
      return;
    }

    try {
      setEditSubmitting(true);
      const res = await api.put(`/letters/${activeLetter.id}`, {
        title: editFormData.title.trim(),
        content: editFormData.content.trim(),
        unlockDate: editFormData.unlockDate || null
      });

      if (res.data?.success) {
        const updated = res.data.letter;
        setActiveLetter((prev) => ({ ...prev, ...updated }));
        setLetters((prev) =>
          prev.map((item) => (item.id === activeLetter.id ? { ...item, ...updated } : item))
        );
        setIsEditModalOpen(false);
        await fetchLetters();
      }
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update letter.');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteLetter = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.delete(`/letters/${deleteTarget.id}`);
      setLetters((prev) => prev.filter((ltr) => ltr.id !== deleteTarget.id));
      if (activeLetter?.id === deleteTarget.id) {
        setActiveLetter(null);
        setViewMode('ARCHIVE');
      }
      setDeleteTarget(null);
      await fetchLetters();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete letter.');
    } finally {
      setDeleting(false);
    }
  };

  // Helper to format letter type label
  const getLetterTypeLabel = (ltr) => {
    if (ltr.letterType === 'FUTURE') return 'Future Letter ⏳';
    if (ltr.letterType === 'USER') {
      const partner = ltr.recipient?.fullName || 'Another User';
      return `To ${partner}`;
    }
    return 'To Myself';
  };

  // Helper for short letter preview snippet
  const getSnippet = (text) => {
    if (!text) return '';
    const clean = text.replace(/\n+/g, ' ').trim();
    if (clean.length <= 110) return clean;
    return clean.slice(0, 110) + '...';
  };

  // Live preview bindings for the compose form
  const previewSubject = subject;
  const previewContent = content;

  /* =========================================================================
     VIEW 1: DEDICATED FULL LETTER READING VIEW
     ========================================================================= */
  if (viewMode === 'READ' && activeLetter) {
    const isSender = activeLetter.senderId === user?.id;
    const canEdit = isSender && !activeLetter.isLocked;

    return (
      <div 
        className="page-background space-y-6 animate-fadeIn min-h-screen py-8 px-4 sm:px-6 lg:px-8"
        style={{
          backgroundImage: `linear-gradient(rgba(71, 40, 25, 0.16), rgba(250, 241, 226, 0.28)), url(${lettersBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'scroll',
          backgroundColor: '#fdfbf7'
        }}
      >
        {/* Top Navigation Bar: Back Button + Meta Info + Action Controls */}
        <div className="relative z-10 flex items-center justify-between rounded-2xl border border-[#e5d7c4] bg-[#fdfbf7]/90 px-4 py-3 shadow-[0_6px_18px_rgba(61,36,23,0.12)] backdrop-blur-[2px] border-b-[#eee4d6] pb-4 flex-wrap gap-3">
          <button
            onClick={() => setViewMode('ARCHIVE')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#5c3e2e] hover:text-[#2c1810] hover:translate-x-[-2px] transition duration-200"
          >
            <ArrowLeft className="w-4 h-4 text-[#c86d74]" />
            <span>← Back to My Letters</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#f5d5db] text-[#2c1810] shadow-xs">
              {getLetterTypeLabel(activeLetter)}
            </span>
            <span className="text-xs text-[#806958] font-serif hidden sm:inline">
              {formatFullDate(activeLetter.createdAt)}
            </span>

            {/* Edit Button (if allowed) */}
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                icon={Edit2}
                onClick={() => openEditModal(activeLetter)}
              >
                Edit
              </Button>
            )}

            {/* Delete Button */}
            <Button
              variant="ghost"
              size="sm"
              icon={Trash2}
              onClick={() => setDeleteTarget(activeLetter)}
              className="text-[#a8323e] hover:bg-[#fbeeed]"
            >
              Delete
            </Button>
          </div>
        </div>

        {/* The Realistic Parchment Scroll Reading Experience */}
        <div className="py-4">
          <div className="relative max-w-xl mx-auto shadow-2xl rounded-xl transition duration-300">
            {/* Top Curled Scroll Roll */}
            <div className="scroll-roll w-full" />

            {/* Parchment Body with Aged Texture */}
            <div className="parchment-sheet p-8 sm:p-12 relative min-h-[520px] flex flex-col justify-between overflow-hidden shadow-paper">
              <div className="space-y-6">
                {/* Subject in Calligraphy */}
                <h2 className="font-handwriting text-3xl sm:text-4xl font-bold text-[#3d2417] leading-tight text-center sm:text-left border-b border-[#ddcca8]/60 pb-3">
                  {activeLetter.title}
                </h2>

                {/* Letter Body */}
                {activeLetter.isLocked ? (
                  <div className="p-6 rounded-2xl bg-[#faf2e4] border border-[#e5d2b3] text-center space-y-2 font-serif text-[#805035]">
                    <Lock className="w-6 h-6 text-[#c86d74] mx-auto" />
                    <p className="font-semibold text-sm">This future time capsule is sealed.</p>
                    <p className="text-xs text-[#9c6a30]">
                      The words remain safeguarded until {formatFullDate(activeLetter.unlockDate)}.
                    </p>
                  </div>
                ) : (
                  <div className="font-handwriting text-lg sm:text-xl text-[#4a2e1b] leading-relaxed whitespace-pre-wrap pt-2">
                    {activeLetter.content}
                  </div>
                )}
              </div>

              {/* Bottom Signature & Quill */}
              <div className="pt-8 relative flex items-end justify-between border-t border-[#ddcca8]/50 mt-6">
                <div className="font-handwriting text-lg text-[#4a2e1b] space-y-0.5">
                  <p>With love,</p>
                  <p className="font-bold text-2xl">
                    {activeLetter.sender?.fullName || user?.fullName || 'Valli'}{' '}
                    <span className="text-[#c86d74]">♡</span>
                  </p>
                </div>

                {/* Vintage Goose Quill Pen Illustration */}
                <div className="text-4xl sm:text-5xl transform rotate-45 opacity-90 select-none pointer-events-none drop-shadow-md">
                  🪶
                </div>
              </div>
            </div>

            {/* Bottom Curled Scroll Roll */}
            <div className="scroll-roll w-full" />
          </div>
        </div>

        {/* Edit Letter Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Sealed Letter"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleUpdateLetter} className="space-y-4">
            {editError && (
              <div className="p-3 rounded-xl bg-[#fbeeed] border border-[#f4cfd3] text-[#a8323e] text-xs font-semibold">
                {editError}
              </div>
            )}

            <Input
              label="Subject / Title"
              value={editFormData.title}
              onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
              required
            />

            <Input
              label="Letter Content"
              isTextarea
              rows={8}
              value={editFormData.content}
              onChange={(e) => setEditFormData({ ...editFormData, content: e.target.value })}
              required
            />

            {activeLetter.letterType === 'FUTURE' && (
              <Input
                label="Unlock Date"
                type="date"
                value={editFormData.unlockDate}
                onChange={(e) => setEditFormData({ ...editFormData, unlockDate: e.target.value })}
              />
            )}

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
          onConfirm={handleDeleteLetter}
          title="Delete Letter?"
          message="Are you sure you want to delete this letter? This letter will be permanently removed from your archive."
          loading={deleting}
          confirmButtonText="Delete"
        />
      </div>
    );
  }

  /* =========================================================================
     VIEW 2: COMPOSE LETTER VIEW (EXACT EXISTING FORM & SCROLL PREVIEW)
     ========================================================================= */
  if (viewMode === 'COMPOSE') {
    return (
      <div 
        className="page-background space-y-6 animate-fadeIn min-h-screen py-8 px-4 sm:px-6 lg:px-8"
        style={{
          backgroundImage: `linear-gradient(rgba(71, 40, 25, 0.16), rgba(250, 241, 226, 0.28)), url(${lettersBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'scroll',
          backgroundColor: '#fdfbf7'
        }}
      >
        {/* Back to Archive Header */}
        <div className="relative z-10 flex items-center justify-between rounded-2xl border border-[#e5d7c4] bg-[#fdfbf7]/90 px-4 py-3 shadow-[0_6px_18px_rgba(61,36,23,0.12)] backdrop-blur-[2px] border-b-[#eee4d6] pb-3">
          <button
            onClick={() => setViewMode('ARCHIVE')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#5c3e2e] hover:text-[#2c1810] hover:translate-x-[-2px] transition duration-200"
          >
            <ArrowLeft className="w-4 h-4 text-[#c86d74]" />
            <span>← Back to My Letters</span>
          </button>
          <span className="text-xs text-[#806958] font-serif italic">
            "Some words are meant to be written..."
          </span>
        </div>

        {/* Two-Column Layout (Form on Left, Live Scroll Preview on Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Compose Form (7 Cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl warm-card border border-[#e8dfd1] shadow-soft space-y-6">
            <div className="flex items-center gap-2 border-b border-[#eee4d6] pb-4">
              <h2 className="text-xl font-serif font-bold text-memora-espresso">
                Compose a Letter
              </h2>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-[#fbeeed] border border-[#f4cfd3] text-memora-rose text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-2xl bg-[#eef7ee] border border-[#cfe8cf] text-[#2e6930] text-xs font-semibold">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleCreateLetter} className="space-y-5">
              {/* Type Selection */}
              <div>
                <label className="block text-xs font-semibold text-memora-espresso mb-2">
                  Who is this letter for?
                </label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {[
                    { id: 'MYSELF', label: 'To Myself' },
                    { id: 'USER', label: 'To Another User' },
                    { id: 'FUTURE', label: 'Future Letter' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setLetterType(tab.id)}
                      className={`py-2.5 px-2 rounded-2xl text-xs font-semibold text-center transition ${
                        letterType === tab.id
                          ? 'bg-[#f5d5db] text-memora-espresso shadow-xs'
                          : 'bg-[#faf4ec] text-[#806958] hover:bg-[#f2e6d6]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient Search (if USER) */}
              {letterType === 'USER' && (
                <div className="space-y-2 relative">
                  <label className="block text-xs font-semibold text-memora-espresso">
                    Choose Recipient
                  </label>
                  <Input
                    placeholder="Search by username or email..."
                    value={recipientQuery}
                    onChange={(e) => searchUsers(e.target.value)}
                  />
                  {selectedRecipient && (
                    <div className="text-xs text-[#4a6b4c] font-semibold flex items-center gap-1.5 pt-1">
                      <span>✓ Selected:</span>
                      <span className="font-bold">{selectedRecipient.fullName}</span>
                      <span className="text-[#806958]">(@{selectedRecipient.username})</span>
                    </div>
                  )}
                  {recipientResults.length > 0 && !selectedRecipient && (
                    <div className="absolute top-full left-0 right-0 z-20 bg-white border border-[#e8dfd1] rounded-2xl shadow-xl mt-1 max-h-40 overflow-y-auto">
                      {recipientResults.map((u) => (
                        <div
                          key={u.id}
                          onClick={() => {
                            setSelectedRecipient(u);
                            setRecipientQuery(`${u.fullName} (@${u.username})`);
                            setRecipientResults([]);
                          }}
                          className="p-3 hover:bg-[#faf4ec] cursor-pointer text-xs border-b border-[#f3ebde] last:border-b-0"
                        >
                          <div className="font-semibold text-[#2c1810]">{u.fullName}</div>
                          <div className="text-[11px] text-[#806958]">@{u.username} • {u.email}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Unlock Date (if FUTURE) */}
              {letterType === 'FUTURE' && (
                <div>
                  <Input
                    label="Seal Until (Unlock Date)"
                    type="date"
                    value={unlockDate}
                    onChange={(e) => setUnlockDate(e.target.value)}
                    required
                  />
                  <p className="text-[11px] text-[#806958] font-serif italic mt-1">
                    This letter will stay sealed in your sanctuary until this exact date arrives.
                  </p>
                </div>
              )}

              {/* Subject */}
              <Input
                label="Letter Subject"
                placeholder="e.g., Read this when you feel lost..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />

              {/* Letter Body */}
              <Input
                label="Your Letter"
                isTextarea
                rows={7}
                placeholder="Pour your heart onto the page..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={submitting}
                  icon={Send}
                >
                  Seal & Save Letter
                </Button>
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN: Live Physical Parchment Scroll Preview (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-sm relative">
              {/* Top Curled Scroll Roll */}
              <div className="scroll-roll w-full" />

              {/* Parchment Sheet */}
              <div className="parchment-sheet p-6 sm:p-8 min-h-[460px] flex flex-col justify-between shadow-paper relative">
                <div className="space-y-4">
                  <h3 className="font-handwriting text-2xl font-bold text-[#3d2417] leading-snug border-b border-[#ddcca8]/60 pb-2">
                    {previewSubject || 'Subject goes here...'}
                  </h3>

                  <p className="font-handwriting text-base text-[#4a2e1b] leading-relaxed whitespace-pre-wrap">
                    {previewContent || 'Begin penning your thoughts to see them appear here...'}
                  </p>
                </div>

                {/* Bottom Signature with Quill */}
                <div className="pt-6 relative flex items-end justify-between border-t border-[#ddcca8]/50">
                  <div className="font-handwriting text-sm text-[#4a2e1b]">
                    <p>With love,</p>
                    <p className="font-bold text-lg">
                      {user?.fullName || 'Valli'} <span className="text-[#c86d74]">♡</span>
                    </p>
                  </div>

                  <div className="text-3xl transform rotate-45 opacity-80 select-none">
                    🪶
                  </div>
                </div>
              </div>

              {/* Bottom Curled Scroll Roll */}
              <div className="scroll-roll w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     VIEW 3: DEFAULT ARCHIVE VIEW ("My Letters ✉️")
     ========================================================================= */
  return (
    <div 
      className="page-background space-y-8 animate-fadeIn min-h-screen py-8 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage: `linear-gradient(rgba(71, 40, 25, 0.16), rgba(250, 241, 226, 0.28)), url(${lettersBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'scroll',
        backgroundColor: '#fdfbf7'
      }}
    >
      {/* Archive Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-[#f7eee1]/90 px-5 py-4 shadow-[0_8px_24px_rgba(61,36,23,0.16)] backdrop-blur-[2px]">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-[-0.01em] text-[#2c1810] flex items-center gap-2">
            <span>My Letters</span>
            <span className="text-2xl">✉️</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#705645] font-serif mt-1">
            Words you wanted to keep forever.
          </p>
        </div>

        {/* Compose Letter Action Button */}
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setViewMode('COMPOSE')}
          className="bg-[#d78991] border-[#cc7c85] shadow-[0_5px_12px_rgba(156,74,84,0.18)] hover:bg-[#c97881]"
        >
          Compose Letter
        </Button>
      </div>

      {/* Archive Letters List */}
      <section className="relative z-10 rounded-[26px] bg-[#fbf7ef]/95 p-4 shadow-[0_14px_34px_rgba(61,36,23,0.16)] sm:p-6">
        {loading ? (
          <div className="py-12 text-center text-sm font-serif text-[#806958]">
            Unlocking your personal letter chest...
          </div>
        ) : letters.length === 0 ? (
          <div className="mx-auto flex max-w-lg flex-col items-center justify-center px-5 py-10 text-center sm:py-12">
            <div className="relative mb-5 flex h-20 w-24 items-center justify-center rounded-xl border border-[#dfcdb6] bg-[#f7eee1] shadow-[0_8px_14px_rgba(61,36,23,0.12)] rotate-[-3deg]">
              <Mail className="h-9 w-9 text-[#b96b72]" strokeWidth={1.35} />
              <span className="absolute -top-2 left-1/2 h-5 w-10 -translate-x-1/2 rotate-[4deg] bg-[#e89da2]/60" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#2c1810]">
              A quiet page for your words
            </h3>
            <p className="mx-auto mt-2 max-w-sm font-serif text-sm leading-relaxed text-[#806958]">
              Write to yourself, seal a time capsule, or send something tender to someone special.
            </p>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setViewMode('COMPOSE')}
              className="mt-5 bg-[#d78991] border-[#cc7c85] hover:bg-[#c97881]"
            >
              Write Your First Letter
            </Button>
          </div>
        ) : (
        <div className="space-y-3">
          {letters.map((ltr) => {
            const isSender = ltr.senderId === user?.id;

            return (
              <div
                key={ltr.id}
                onClick={() => {
                  setActiveLetter(ltr);
                  setViewMode('READ');
                }}
                className="group relative flex cursor-pointer flex-col justify-between gap-4 rounded-2xl bg-[#fffdf8] p-5 shadow-[0_4px_12px_rgba(61,36,23,0.08)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_9px_20px_rgba(61,36,23,0.13)] sm:flex-row sm:items-center sm:p-6"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base">💌</span>
                    <h3 className="text-base font-serif font-bold text-[#2c1810] group-hover:text-[#c86d74] transition truncate">
                      {ltr.title}
                    </h3>
                  </div>

                  <div className="text-xs text-[#806958] font-serif flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[#5c3e2e]">
                      {getLetterTypeLabel(ltr)}
                    </span>
                    <span>·</span>
                    <span>{formatFullDate(ltr.createdAt)}</span>
                    {ltr.isLocked && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#c86d74] font-semibold bg-[#fbeeed] px-2 py-0.5 rounded-full">
                        <Lock className="w-3 h-3" /> Sealed until {formatFullDate(ltr.unlockDate)}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#705645] font-serif italic line-clamp-2 pt-1 pr-4">
                    {ltr.isLocked
                      ? 'This time capsule is sealed until its unlock date.'
                      : getSnippet(ltr.content)}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(ltr);
                    }}
                    className="p-2 rounded-xl text-[#a89080] hover:text-[#a8323e] hover:bg-[#fbeeed] transition"
                    title="Delete Letter"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="w-8 h-8 rounded-full bg-[#faf4ec] group-hover:bg-[#fbeeed] flex items-center justify-center text-[#c86d74] text-sm font-bold transition group-hover:translate-x-1 duration-200">
                    →
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </section>

      {/* Delete Confirmation Modal for Archive view */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteLetter}
        title="Delete Letter?"
        message="Are you sure you want to delete this letter? This letter and its contents will be permanently erased."
        loading={deleting}
        confirmButtonText="Delete"
      />
    </div>
  );
};

export default LettersPage;
