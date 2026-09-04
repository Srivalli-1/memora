import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, Edit2, Clock, Calendar, Image as ImageIcon, X } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import DeleteConfirmModal from '../components/common/DeleteConfirmModal';
import { formatDate } from '../utils/formatters';

const TimelinePage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: ''
  });
  const [existingImage, setExistingImage] = useState(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete Confirm Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const res = await api.get('/timeline');
      if (res.data?.success) {
        setEvents(res.data.events || []);
      }
    } catch (err) {
      console.error('Failed to load timeline:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, []);

  const openCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: ''
    });
    setExistingImage(null);
    setRemoveExistingImage(false);
    setSelectedFile(null);
    setFilePreview('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (evt) => {
    setIsEditing(true);
    setEditingId(evt.id);
    setFormData({
      title: evt.title || '',
      description: evt.description || '',
      date: evt.date ? new Date(evt.date).toISOString().split('T')[0] : '',
      time: evt.time || ''
    });
    setExistingImage(evt.images?.[0] || null);
    setRemoveExistingImage(false);
    setSelectedFile(null);
    setFilePreview('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim() || !formData.date) {
      setFormError('Title and date are required.');
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('description', formData.description.trim() || 'A sweet moment in time. ♡');
      data.append('date', formData.date);
      if (formData.time) {
        data.append('time', formData.time);
      }

      if (selectedFile) {
        data.append('images', selectedFile);
      }

      if (isEditing && editingId) {
        if (removeExistingImage && existingImage) {
          data.append('removeImageIds', JSON.stringify([existingImage.id]));
        }

        const res = await api.put(`/timeline/${editingId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (res.data?.success) {
          const updated = res.data.event;
          setEvents((prev) =>
            prev.map((item) => (item.id === editingId ? updated : item))
          );
          setIsModalOpen(false);
          await fetchTimeline();
        }
      } else {
        const res = await api.post('/timeline', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (res.data?.success) {
          setIsModalOpen(false);
          await fetchTimeline();
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save milestone.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMilestone = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.delete(`/timeline/${deleteTarget.id}`);
      setEvents((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete event.');
    } finally {
      setDeleting(false);
    }
  };

  // Sample items matching Panel 6 fallback if empty
  const sampleEvents = [
    {
      id: 's1',
      date: '2026-08-01',
      time: '10:00 AM',
      title: 'Made our first commitment',
      description: 'To always be honest. ♡',
      img: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=300&auto=format&fit=crop&q=60'
    },
    {
      id: 's2',
      date: '2026-08-10',
      time: '08:30 PM',
      title: 'Watched a movie together',
      description: 'Even though we were apart. ♡',
      img: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=300&auto=format&fit=crop&q=60'
    },
    {
      id: 's3',
      date: '2026-08-25',
      time: '11:15 PM',
      title: 'First Long Call',
      description: 'Talked for hours and lost track of time. ♡',
      img: 'https://images.unsplash.com/photo-1534536281715-e28d76689b4d?w=300&auto=format&fit=crop&q=60'
    },
    {
      id: 's4',
      date: '2026-09-04',
      time: '02:00 PM',
      title: 'Started using Memora',
      description: 'The beginning of our journey here. ♡',
      img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=60'
    }
  ];

  const displayList = events.length > 0 ? events : sampleEvents;

  return (
    <div className="space-y-8 animate-fadeIn relative">
      {/* Botanical Corner Accents (Panel 6) */}
      <div className="absolute -top-6 -left-6 text-3xl opacity-75 select-none pointer-events-none transform -rotate-12">
        🌸🌿
      </div>
      <div className="absolute -bottom-6 -right-6 text-4xl opacity-75 select-none pointer-events-none transform rotate-45">
        🌿🍃
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2c1810]">
            Our Timeline
          </h1>
          <p className="text-xs sm:text-sm text-[#705645] font-serif mt-1">
            A journey of little and big moments <span className="text-[#c86d74]">♡</span>
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={openCreateModal}
        >
          Add Milestone
        </Button>
      </div>

      {/* Main Grid: Vertical Timeline on Left, Physical Polaroid Stack on Right (Panel 6) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Timeline Milestone Cards (8.5 Cols) */}
        <div className="lg:col-span-8 relative pl-24 sm:pl-28 space-y-6">
          {/* Vertical Connecting Line with Soft Pink Dots */}
          <div className="absolute left-[70px] sm:left-[80px] top-6 bottom-6 w-0.5 bg-[#d8cbb8]" />

          {displayList.map((evt) => {
            const hasImage = evt.images?.[0]?.url || evt.img;
            const isRealEvent = events.some((e) => e.id === evt.id);

            return (
              <div key={evt.id} className="relative group flex items-center">
                {/* Date & Time on the Left of the Line */}
                <div className="absolute -left-24 sm:-left-28 w-16 text-right font-serif">
                  <span className="block text-xs font-semibold text-[#2c1810]">
                    {formatDate(evt.date)}
                  </span>
                  {evt.time && (
                    <span className="block text-[10px] text-[#806958] flex items-center justify-end gap-0.5 mt-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {evt.time}
                    </span>
                  )}
                </div>

                {/* Soft Pink Connector Dot */}
                <div className="absolute left-[63px] sm:left-[73px] w-4 h-4 rounded-full bg-[#fdfbf7] border-2 border-[#e89da2] shadow-xs z-10 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#e89da2]" />
                </div>

                {/* Milestone Event Plaque */}
                <div className="flex-1 ml-6 p-4 rounded-2xl parchment-plaque flex items-center justify-between gap-4 group">
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Photo Thumbnail */}
                    {hasImage ? (
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-[#eee4d6] shadow-xs">
                        <img
                          src={evt.images?.[0]?.url || evt.img}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-[#faf4ec] flex items-center justify-center text-xl text-[#c86d74] flex-shrink-0 border border-[#eee4d6]">
                        🌸
                      </div>
                    )}

                    <div className="min-w-0">
                      <h3 className="text-sm font-serif font-bold text-[#2c1810] truncate">
                        {evt.title}
                      </h3>
                      <p className="text-xs text-[#705645] font-serif italic mt-0.5 line-clamp-2">
                        {evt.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions: Edit & Delete for real events */}
                  {isRealEvent && (
                    <div className="flex items-center gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(evt)}
                        className="p-1.5 rounded-lg text-[#806958] hover:text-[#2c1810] hover:bg-[#ede3d5] transition text-xs"
                        title="Edit Milestone"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(evt)}
                        className="p-1.5 rounded-lg text-[#806958] hover:text-[#a8323e] hover:bg-[#fbeeed] transition text-xs"
                        title="Delete Milestone"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Physical Stacked Polaroids & Pinned Kraft Note (Panel 6) */}
        <div className="lg:col-span-4 flex flex-col items-center lg:items-end justify-center pt-8">
          <div className="relative w-56 sm:w-60">
            {/* Background Polaroid 1 */}
            <div className="polaroid-frame w-52 transform -rotate-6 absolute -top-4 -left-4 shadow-xl">
              <div className="w-full h-36 bg-[#c4b5a3] rounded-xs overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&auto=format&fit=crop&q=60"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Foreground Polaroid Note: "Collecting moments, not things. ♡" */}
            <div className="relative polaroid-frame w-52 transform rotate-3 shadow-2xl bg-white p-4 pt-3 pb-8">
              {/* Paperclip Accent at top */}
              <div className="w-4 h-7 border-2 border-[#826e57] rounded-full absolute -top-3.5 left-6 z-20 shadow-xs" />

              <div className="w-full h-40 bg-[#f6ecdc] rounded-xs border border-[#e8dfd1] flex flex-col items-center justify-center p-4 text-center space-y-2">
                <p className="font-handwriting text-2xl text-[#3d2417] leading-snug font-bold">
                  Collecting <br />
                  moments, <br />
                  not things.
                </p>
                <div className="text-2xl text-[#c86d74]">♡</div>
              </div>
            </div>

            {/* Botanical dried leaves beneath stack */}
            <div className="absolute -bottom-6 -left-4 text-3xl opacity-70 select-none pointer-events-none">
              🌿🍃
            </div>
          </div>
        </div>
      </div>

      {/* New/Edit Milestone Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Milestone' : 'Add Timeline Milestone'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-[#fbeeed] border border-[#f4cfd3] text-[#a8323e] text-xs font-semibold">
              {formError}
            </div>
          )}

          <Input
            label="Milestone Title"
            placeholder="e.g., First Long Call"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
            <Input
              label="Time (Optional)"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            />
          </div>

          <Input
            label="Short Reflection Note"
            placeholder="e.g., Talked for hours and lost track of time. ♡"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          {/* Existing Photo in Edit Mode */}
          {isEditing && existingImage && !removeExistingImage && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#4a2e1b]">
                Current Photo
              </label>
              <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#e8dfd1]">
                <img src={existingImage.url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setRemoveExistingImage(true)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-[#120804]/70 text-white hover:bg-[#a8323e] transition"
                  title="Remove photo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Attach New Polaroid Photo */}
          <div>
            <label className="block text-xs font-semibold text-[#4a2e1b] mb-1.5">
              {existingImage && !removeExistingImage ? 'Replace Photo (Optional)' : 'Attach Polaroid Photo (Optional)'}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setSelectedFile(e.target.files[0]);
                  setFilePreview(URL.createObjectURL(e.target.files[0]));
                }
              }}
              className="w-full text-xs text-[#4a2e1b] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#fbeeed] file:text-[#c86d74] hover:file:bg-[#f7d8dc] cursor-pointer"
            />
            {filePreview && (
              <div className="mt-2.5 w-16 h-16 rounded-xl overflow-hidden border border-[#e8dfd1]">
                <img src={filePreview} alt="preview" className="w-full h-full object-cover" />
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
              {isEditing ? 'Save Changes' : 'Add to Timeline'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteMilestone}
        title="Delete Timeline Event?"
        message="Are you sure you want to delete this event? This milestone will be permanently removed from your journey."
        loading={deleting}
        confirmButtonText="Delete"
      />
    </div>
  );
};

export default TimelinePage;
