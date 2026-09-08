import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Plus,
  Image as ImageIcon,
  Calendar,
  Sparkles,
  Edit2,
  Trash2,
  Lock,
  Globe,
  Search,
  X
} from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import DeleteConfirmModal from '../components/common/DeleteConfirmModal';
import { formatDate, formatFullDate, getMoodMeta, MOOD_OPTIONS } from '../utils/formatters';
import memoriesBg from '../assets/timeline-bg.png';

const MemoriesPage = () => {
  const { user } = useAuth();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState('ALL');

  // View / Detail Modal
  const [detailMemory, setDetailMemory] = useState(null);

  // Create / Edit Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    mood: 'Happier',
    privacyStatus: 'PRIVATE'
  });
  const [existingImages, setExistingImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete Confirm Modal State
  const [deleteTarget, setDeleteTarget] = useState(null); // memory object to delete
  const [deleting, setDeleting] = useState(false);

  const fetchMemories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/memories');
      if (res.data?.success) {
        setMemories(res.data.memories || []);
      }
    } catch (err) {
      console.error('Failed to load memories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const openCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      mood: 'Happier',
      privacyStatus: 'PRIVATE'
    });
    setExistingImages([]);
    setSelectedFiles([]);
    setFilePreviews([]);
    setFormError('');
    setIsFormOpen(true);
  };

  const openEditModal = (mem) => {
    setIsEditing(true);
    setEditingId(mem.id);
    setFormData({
      title: mem.title,
      description: mem.description,
      date: new Date(mem.date).toISOString().split('T')[0],
      mood: mem.mood || 'Happier',
      privacyStatus: mem.privacyStatus || 'PRIVATE'
    });
    setExistingImages(mem.images || []);
    setSelectedFiles([]);
    setFilePreviews([]);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
      const previews = filesArray.map((file) => URL.createObjectURL(file));
      setFilePreviews(previews);
    }
  };

  const handleDeleteIndividualImage = async (imageId) => {
    if (!editingId) return;
    try {
      await api.delete(`/memories/${editingId}/images/${imageId}`);
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
      if (detailMemory && detailMemory.id === editingId) {
        setDetailMemory((prev) => ({
          ...prev,
          images: prev.images.filter((img) => img.id !== imageId)
        }));
      }
      fetchMemories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove image.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim() || !formData.description.trim()) {
      setFormError('Please provide a title and memory description.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = new FormData();
      payload.append('title', formData.title.trim());
      payload.append('description', formData.description.trim());
      payload.append('date', formData.date);
      payload.append('mood', formData.mood);
      payload.append('privacyStatus', formData.privacyStatus);

      selectedFiles.forEach((file) => {
        payload.append('images', file);
      });

      if (isEditing && editingId) {
        const res = await api.put(`/memories/${editingId}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data?.success) {
          if (detailMemory && detailMemory.id === editingId) {
            setDetailMemory(res.data.memory);
          }
        }
      } else {
        await api.post('/memories', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setIsFormOpen(false);
      fetchMemories();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save memory.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeleteMemory = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.delete(`/memories/${deleteTarget.id}`);
      if (detailMemory && detailMemory.id === deleteTarget.id) {
        setDetailMemory(null);
      }
      setDeleteTarget(null);
      fetchMemories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete memory.');
    } finally {
      setDeleting(false);
    }
  };

  // Filter memories
  const filteredMemories = memories.filter((mem) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      mem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mem.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMood = selectedMood === 'ALL' || mem.mood === selectedMood;
    return matchesSearch && matchesMood;
  });

  return (
    <div
      className="page-background space-y-8 animate-fadeIn px-4 py-8 sm:px-6 lg:px-10"
      style={{
        backgroundImage: `linear-gradient(rgba(250, 245, 237, 0.18), rgba(250, 245, 237, 0.18)), url(${memoriesBg})`,
        backgroundColor: '#fdfbf7',
        backgroundAttachment: 'scroll',
      }}
    >
      <div className="mx-auto max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2c1810] flex items-center gap-2">
            Memories 📸
          </h1>
          <p className="text-xs sm:text-sm text-[#705645] font-serif mt-1 italic">
            "Moments captured in time, preserved in your private sanctuary."
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={openCreateModal}
          className="shadow-md rounded-2xl"
        >
          + Add Memory
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl parchment-plaque">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#806958] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search memories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#fdfbf7] border border-[#e8dfd1] rounded-xl text-[#2c1810] focus:outline-none focus:border-[#e89da2]"
          />
        </div>

        {/* Mood Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedMood('ALL')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${
              selectedMood === 'ALL'
                ? 'bg-[#f5d5db] text-[#2c1810] font-semibold shadow-xs'
                : 'bg-[#fdfbf7] text-[#806958] border border-[#e8dfd1] hover:bg-[#f5eee6]'
            }`}
          >
            All
          </button>
          {MOOD_OPTIONS.map((mood) => (
            <button
              key={mood}
              onClick={() => setSelectedMood(mood)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                selectedMood === mood
                  ? 'bg-[#f5d5db] text-[#2c1810] font-semibold shadow-xs'
                  : 'bg-[#fdfbf7] text-[#806958] border border-[#e8dfd1] hover:bg-[#f5eee6]'
              }`}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>

      {/* Memories Scrapbook Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#806958] font-serif parchment-plaque rounded-3xl">
          Opening your memory collection... ♡
        </div>
      ) : filteredMemories.length === 0 ? (
        <div className="mx-auto max-w-xl space-y-3 rounded-3xl border border-[#e8dfd1] parchment-plaque p-7 text-center sm:p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#f4cfd3] bg-[#fdf2f4] text-[#c86d74] shadow-sm">
            <ImageIcon className="h-6 w-6" />
          </div>
          <p className="font-serif text-lg font-semibold text-[#3d2417]">
            Your memory shelf is waiting.
          </p>
          <p className="text-xs text-[#806958] font-serif italic">
            Click "+ Add Memory" above to preserve your first beautiful moment ♡
          </p>
          <Button variant="primary" size="sm" icon={Plus} onClick={openCreateModal}>
            Add Your First Memory
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {filteredMemories.map((mem) => {
            const hasImages = mem.images && mem.images.length > 0;
            const moodMeta = getMoodMeta(mem.mood);
            const isOwner = mem.userId === user?.id;

            return (
              <div
                key={mem.id}
                onClick={() => setDetailMemory(mem)}
                className="polaroid-frame cursor-pointer group hover:border-[#d98c92] transition-all duration-300 transform hover:-translate-y-1 relative"
              >
                {/* Washi Tape at Top */}
                <div className="washi-tape absolute -top-2.5 left-1/2 -translate-x-1/2 z-10" />

                {/* Photo Display */}
                <div className="w-full h-48 sm:h-52 bg-[#eaddcb] rounded-xs overflow-hidden relative">
                  {hasImages ? (
                    <img
                      src={mem.images[0].url}
                      alt={mem.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-gradient-to-br from-[#f8f2e9] to-[#ebdccb]">
                      <span className="text-3xl mb-1">{moodMeta.emoji}</span>
                      <span className="text-xs text-[#806958] font-serif italic">
                        {mem.mood || 'Cherished Memory'}
                      </span>
                    </div>
                  )}

                  {/* Multi-Photo Count Badge */}
                  {mem.images && mem.images.length > 1 && (
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold backdrop-blur-xs">
                      +{mem.images.length - 1} photos
                    </span>
                  )}
                </div>

                {/* Details Section */}
                <div className="pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#806958]">
                      {formatDate(mem.date)}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${moodMeta.bg}`}
                    >
                      {moodMeta.emoji} {mem.mood}
                    </span>
                  </div>

                  <h3 className="text-sm font-serif font-bold text-[#2c1810] line-clamp-1 group-hover:text-[#c86d74] transition">
                    {mem.title}
                  </h3>

                  <p className="text-xs text-[#543b2b] font-serif italic line-clamp-2 leading-relaxed">
                    {mem.description}
                  </p>

                  {/* Action Buttons: Edit ✏️ and Delete 🗑️ */}
                  {isOwner && (
                    <div
                      className="pt-2 border-t border-[#eee4d6] flex items-center justify-end gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => openEditModal(mem)}
                        className="p-1.5 rounded-lg text-[#806958] hover:text-[#2c1810] hover:bg-[#f5eee6] text-xs transition flex items-center gap-1 font-semibold"
                        title="Edit Memory"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => setDeleteTarget(mem)}
                        className="p-1.5 rounded-lg text-[#806958] hover:text-[#a8323e] hover:bg-[#fbeeed] text-xs transition flex items-center gap-1 font-semibold"
                        title="Delete Memory"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAIL MODAL (Read Individual Memory) */}
      {detailMemory && (
        <Modal
          isOpen={Boolean(detailMemory)}
          onClose={() => setDetailMemory(null)}
          title={detailMemory.title}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6">
            {/* Gallery Images */}
            {detailMemory.images && detailMemory.images.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto p-1">
                {detailMemory.images.map((img) => (
                  <div
                    key={img.id}
                    className="relative rounded-xl overflow-hidden border border-[#e8dfd1] h-48 bg-[#f5eee6]"
                  >
                    <img
                      src={img.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Meta Row */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#eee4d6] pb-3 text-xs text-[#806958]">
              <span className="font-semibold">
                Captured on {formatFullDate(detailMemory.date)}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#fbeeed] text-[#b94a55] font-bold">
                {detailMemory.mood}
              </span>
            </div>

            {/* Full Description */}
            <p className="font-serif text-sm sm:text-base text-[#3d2417] leading-relaxed whitespace-pre-wrap">
              {detailMemory.description}
            </p>

            {/* Modal Actions */}
            {detailMemory.userId === user?.id && (
              <div className="pt-4 border-t border-[#eee4d6] flex items-center justify-end gap-3">
                <Button
                  size="sm"
                  variant="secondary"
                  icon={Edit2}
                  onClick={() => {
                    const mem = detailMemory;
                    setDetailMemory(null);
                    openEditModal(mem);
                  }}
                >
                  Edit Memory ✏️
                </Button>

                <Button
                  size="sm"
                  variant="danger"
                  icon={Trash2}
                  onClick={() => {
                    const mem = detailMemory;
                    setDetailMemory(null);
                    setDeleteTarget(mem);
                  }}
                >
                  Delete 🗑️
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* CREATE / EDIT MEMORY MODAL */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={isEditing ? 'Edit Memory ✏️' : 'Add a New Memory 📸'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-[#fbeeed] border border-[#f4cfd3] text-[#a8323e] text-xs font-semibold">
              {formError}
            </div>
          )}

          <Input
            label="Memory Title"
            placeholder="e.g. A Sunset We Will Never Forget"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-[#4a2e1b] mb-1.5">
                Mood Tag
              </label>
              <select
                value={formData.mood}
                onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                className="w-full bg-[#fdfbf7] border border-[#e8dfd1] rounded-2xl px-3 py-2 text-xs text-[#2c1810] focus:outline-none focus:border-[#e89da2]"
              >
                {MOOD_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Memory Description / Story"
            isTextarea
            rows={5}
            placeholder="Describe the feelings, sounds, and moments..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />

          {/* Existing Photos with Individual Delete (if editing) */}
          {isEditing && existingImages.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#4a2e1b]">
                Existing Photos ({existingImages.length}) — Click 🗑️ to remove
              </label>
              <div className="flex flex-wrap gap-2.5">
                {existingImages.map((img) => (
                  <div
                    key={img.id}
                    className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#e8dfd1] group"
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleDeleteIndividualImage(img.id)}
                      className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      title="Remove this photo"
                    >
                      <Trash2 className="w-4 h-4 text-[#ff8088]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attach New Photos */}
          <div>
            <label className="block text-xs font-semibold text-[#4a2e1b] mb-1.5">
              {isEditing ? 'Upload Additional Photos (Optional)' : 'Attach Photos (One or Multiple)'}
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="w-full text-xs text-[#4a2e1b] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#fbeeed] file:text-[#c86d74] hover:file:bg-[#f7d8dc] cursor-pointer"
            />
            {filePreviews.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {filePreviews.map((prev, idx) => (
                  <div
                    key={idx}
                    className="w-14 h-14 rounded-xl overflow-hidden border border-[#e8dfd1]"
                  >
                    <img src={prev} alt="preview" className="w-full h-full object-cover" />
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
              onClick={() => setIsFormOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={submitting}
            >
              {isEditing ? 'Save Changes' : 'Preserve Memory'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteMemory}
        title="Delete Memory?"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This memory and its associated photos will be permanently deleted.`}
        loading={deleting}
      />
      </div>
    </div>
  );
};

export default MemoriesPage;
