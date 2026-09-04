import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, Edit3, Image as ImageIcon, X, AlertCircle } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import DeleteConfirmModal from '../components/common/DeleteConfirmModal';
import { formatDate, formatFullDate } from '../utils/formatters';

const DiaryPage = () => {
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal State for New/Edit Entry
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    mood: 'Happier'
  });
  const [existingImages, setExistingImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete Confirm Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchEntries = async (keepSelectedId = null) => {
    try {
      setLoading(true);
      const res = await api.get('/diary');
      if (res.data?.success) {
        const list = res.data.entries || [];
        setEntries(list);
        if (keepSelectedId) {
          const found = list.find((e) => e.id === keepSelectedId);
          setSelectedEntry(found || list[0] || null);
        } else if (list.length > 0 && (!selectedEntry || !list.some((e) => e.id === selectedEntry.id))) {
          setSelectedEntry(list[0]);
        } else if (list.length === 0) {
          setSelectedEntry(null);
        }
      }
    } catch (err) {
      console.error('Failed to load diary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const openNewEntry = () => {
    setIsEditing(false);
    setFormData({
      title: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
      mood: 'Happier'
    });
    setExistingImages([]);
    setSelectedFiles([]);
    setFilePreviews([]);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditEntry = () => {
    if (!selectedEntry) return;
    setIsEditing(true);
    setFormData({
      title: selectedEntry.title,
      content: selectedEntry.content,
      date: new Date(selectedEntry.date).toISOString().split('T')[0],
      mood: selectedEntry.mood || 'Happier'
    });
    setExistingImages(selectedEntry.images || []);
    setSelectedFiles([]);
    setFilePreviews([]);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
      const previews = files.map((file) => URL.createObjectURL(file));
      setFilePreviews(previews);
    }
  };

  const handleDeleteIndividualImage = async (imageId) => {
    if (!selectedEntry) return;
    try {
      await api.delete(`/diary/${selectedEntry.id}/images/${imageId}`);
      const updatedExisting = existingImages.filter((img) => img.id !== imageId);
      setExistingImages(updatedExisting);
      setSelectedEntry((prev) => ({
        ...prev,
        images: prev.images.filter((img) => img.id !== imageId)
      }));
      setEntries((prev) =>
        prev.map((item) =>
          item.id === selectedEntry.id
            ? { ...item, images: item.images.filter((img) => img.id !== imageId) }
            : item
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove image.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim() || !formData.content.trim()) {
      setFormError('Please provide a title and journal content.');
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('content', formData.content.trim());
      data.append('date', formData.date);
      data.append('mood', formData.mood || 'Happier');

      if (selectedFiles.length > 0) {
        selectedFiles.forEach((file) => {
          data.append('images', file);
        });
      }

      if (isEditing && selectedEntry) {
        const res = await api.put(`/diary/${selectedEntry.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data?.success) {
          const updated = res.data.entry;
          setSelectedEntry(updated);
          setIsModalOpen(false);
          await fetchEntries(updated.id);
        }
      } else {
        const res = await api.post('/diary', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data?.success) {
          const created = res.data.entry;
          setSelectedEntry(created);
          setIsModalOpen(false);
          await fetchEntries(created.id);
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save page.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEntry = async () => {
    if (!selectedEntry) return;
    try {
      setDeleting(true);
      await api.delete(`/diary/${selectedEntry.id}`);
      setIsDeleteModalOpen(false);
      setSelectedEntry(null);
      await fetchEntries();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete page.');
    } finally {
      setDeleting(false);
    }
  };

  // Fallback sample entry matching Panel 3 if database is completely empty
  const displayEntry = selectedEntry || (entries.length > 0 ? entries[0] : {
    id: 'sample',
    title: 'A little happier today...',
    content:
      'Today felt different. I smiled a bit more, overthought a bit less, and felt closer to the person I want to be. Some days are just gentle reminders that healing is real.',
    date: new Date('2026-09-04'),
    images: [{ url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=60' }]
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2c1810]">
          My Diary
        </h1>
        <p className="text-xs sm:text-sm text-[#705645] font-serif">
          A safe place for your thoughts <span className="text-[#c86d74]">♡</span>
        </p>
      </div>

      {/* Real Physical Desk Stage (Dark Rich Wooden Desk Scene matching Panel 3) */}
      <div className="dark-wood-desk p-6 sm:p-10 lg:p-12 rounded-3xl relative overflow-hidden shadow-2xl">
        {/* Warm Ambient Lamp Glow */}
        <div className="absolute top-0 left-1/3 w-80 h-80 bg-[#e8a85a]/12 rounded-full blur-3xl pointer-events-none" />

        {/* Botanical Dried Flowers on Desk Corners (Matching Panel 3) */}
        <div className="absolute top-3 left-4 text-3xl opacity-75 select-none pointer-events-none transform -rotate-12">
          🌸🌿
        </div>
        <div className="absolute bottom-4 right-4 text-3xl opacity-60 select-none pointer-events-none transform rotate-45">
          🌿🍃
        </div>

        {/* The Open Journal (Physical Book Anatomy) */}
        <div className="relative max-w-4xl mx-auto">
          {/* Stacked Paper Edges on Left and Right (Showing Physical Thickness) */}
          <div className="book-edge-left hidden sm:block" />
          <div className="book-edge-right hidden sm:block" />

          {/* Book Inner Spread */}
          <div className="diary-book grid grid-cols-1 md:grid-cols-2 relative min-h-[580px] bg-[#fbf8f2]">
            {/* Metallic Ring Binder Spine with Cast Shadow */}
            <div className="hidden md:flex diary-spine flex-col justify-around items-center py-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-1">
                  <div className="page-hole" />
                  <div className="binder-ring" />
                  <div className="page-hole" />
                </div>
              ))}
            </div>

            {/* LEFT PAGE: Entries Timeline */}
            <div className="p-6 sm:p-8 md:pr-10 border-b md:border-b-0 md:border-r border-[#e8dfd1] flex flex-col justify-between relative bg-[#fdfbf7] rounded-l-xl">
              <div className="space-y-6">
                {/* + New Entry Button */}
                <button
                  onClick={openNewEntry}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#fbeeed] hover:bg-[#f7d8dc] border border-[#f4cfd3] text-[#2c1810] text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition"
                >
                  <span className="text-sm font-bold text-[#c86d74]">+</span>
                  <span>New Entry</span>
                </button>

                {/* Milestone Entries List */}
                <div className="relative pl-6 space-y-5 max-h-[420px] overflow-y-auto pr-1">
                  {/* Vertical dotted milestone line */}
                  <div className="absolute left-[7px] top-2 bottom-2 w-0.5 border-l-2 border-dotted border-[#d8cbb8]" />

                  {entries.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#806958] font-serif">
                      No entries yet. Click "+ New Entry" above to write your very first page ♡
                    </div>
                  ) : (
                    entries.map((entry) => {
                      const isSelected = displayEntry?.id === entry.id;

                      return (
                        <div
                          key={entry.id}
                          onClick={() => setSelectedEntry(entry)}
                          className={`relative group cursor-pointer transition p-2.5 rounded-xl ${
                            isSelected ? 'bg-[#fbeeed]/80 border border-[#f4cfd3]' : 'hover:bg-[#faf4ea]'
                          }`}
                        >
                          {/* Milestone Dot */}
                          <div
                            className={`absolute -left-[23px] top-4 w-3.5 h-3.5 rounded-full border-2 transition ${
                              isSelected
                                ? 'bg-[#c86d74] border-white shadow-xs'
                                : 'bg-[#fdfbf7] border-[#bda694] group-hover:border-[#c86d74]'
                            }`}
                          />

                          <div>
                            <span className="block text-[11px] font-semibold text-[#806958]">
                              {formatDate(entry.date)}
                            </span>
                            <h4 className="text-xs font-serif font-bold text-[#2c1810] line-clamp-1 mt-0.5">
                              "{entry.title}"
                            </h4>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="pt-4 text-[11px] text-[#9c8474] font-serif italic text-center">
                Memora Personal Sanctuary
              </div>
            </div>

            {/* RIGHT PAGE: Selected Entry on Ruled Paper */}
            <div className="p-6 sm:p-10 md:pl-12 flex flex-col justify-between relative bg-[#fdfbf7] rounded-r-xl overflow-hidden">
              <div className="space-y-4">
                {/* Date at top right */}
                <div className="flex items-center justify-between border-b border-[#eee4d6] pb-3">
                  <span className="font-handwriting text-sm sm:text-base text-[#7a6453]">
                    {formatFullDate(displayEntry.date)}
                  </span>

                  {/* Edit & Delete Controls (Only for real saved entries) */}
                  {selectedEntry && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={openEditEntry}
                        className="p-1.5 rounded-lg text-[#806958] hover:text-[#2c1810] hover:bg-[#ede3d5] text-xs transition"
                        title="Edit Page"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="p-1.5 rounded-lg text-[#806958] hover:text-[#a8323e] hover:bg-[#fbeeed] text-xs transition"
                        title="Delete Page"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Entry Title */}
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2c1810]">
                  {displayEntry.title}
                </h2>

                {/* Journal handwritten text */}
                <div className="font-handwriting text-base sm:text-lg text-[#3d2417] leading-relaxed whitespace-pre-wrap pt-2 min-h-[140px] max-h-[300px] overflow-y-auto pr-2">
                  {displayEntry.content}
                </div>

                {/* Drawn Heart */}
                <div className="text-[#c86d74] text-xl font-handwriting">
                  ♡
                </div>
              </div>

              {/* Bottom Row: Botanical Pressed Flower & Polaroid Photo Gallery */}
              <div className="pt-6 flex items-end justify-between z-10">
                {/* Delicate Pressed Wildflower Accent */}
                <div className="text-2xl opacity-75 select-none transform -rotate-12">
                  🌸🌿
                </div>

                {/* Polaroid Photo(s) Clipped to Page */}
                {displayEntry.images && displayEntry.images.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {displayEntry.images.map((img, idx) => (
                      <div
                        key={img.id || idx}
                        className={`polaroid-frame w-24 sm:w-28 transform transition duration-300 relative ${
                          idx % 2 === 0 ? 'rotate-2 hover:rotate-0' : '-rotate-2 hover:rotate-0'
                        }`}
                      >
                        <div className="w-5 h-2.5 bg-[#e89da2]/50 absolute -top-1.5 left-1/2 -translate-x-1/2 transform -rotate-6 z-20 shadow-xs" />
                        <div className="w-full h-16 sm:h-20 overflow-hidden rounded-xs bg-[#e8ded0]">
                          <img
                            src={img.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Fountain Pen Resting on the Desk to the Right (Panel 3 prop) */}
          <div className="hidden lg:block absolute -right-10 top-1/4 transform rotate-12 pointer-events-none">
            <div className="fountain-pen-prop" />
          </div>
        </div>
      </div>

      {/* New/Edit Entry Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Diary Page' : 'Write in Your Diary'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-[#fbeeed] border border-[#f4cfd3] text-[#a8323e] text-xs font-semibold">
              {formError}
            </div>
          )}

          <Input
            label="Page Title"
            placeholder="e.g., A little happier today..."
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />

          <Input
            label="What is on your heart today?"
            isTextarea
            rows={6}
            placeholder="Write freely. This page is strictly private to your eyes..."
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            required
          />

          {/* Existing Photos Management (when editing) */}
          {isEditing && existingImages.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#4a2e1b]">
                Attached Photos ({existingImages.length})
              </label>
              <div className="flex flex-wrap gap-2.5">
                {existingImages.map((img) => (
                  <div key={img.id} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-[#e8dfd1] shadow-xs">
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleDeleteIndividualImage(img.id)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-[#120804]/70 text-white hover:bg-[#a8323e] transition"
                      title="Delete this photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attach New Polaroid Photo(s) */}
          <div>
            <label className="block text-xs font-semibold text-[#4a2e1b] mb-1.5">
              {isEditing ? 'Add More Photos (Optional)' : 'Attach Polaroid Photo(s) (Optional)'}
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="w-full text-xs text-[#4a2e1b] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#fbeeed] file:text-[#c86d74] hover:file:bg-[#f7d8dc] cursor-pointer"
            />
            {filePreviews.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-2">
                {filePreviews.map((src, i) => (
                  <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border border-[#e8dfd1]">
                    <img src={src} alt={`preview ${i}`} className="w-full h-full object-cover" />
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
              {isEditing ? 'Save Changes' : 'Pen This Page'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteEntry}
        title="Delete Diary Entry?"
        message="Are you sure you want to delete this diary entry? This page and its thoughts will be permanently erased."
        loading={deleting}
        confirmButtonText="Delete"
      />
    </div>
  );
};

export default DiaryPage;
