export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }); // e.g. "4 Sep 2026"
};

export const formatFullDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }); // e.g. "4 September 2026"
};

export const getMoodMeta = (mood) => {
  const map = {
    Happier: { emoji: '✨', bg: 'bg-[#fbeeed] text-[#b94a55] border-[#f4cfd3]' },
    Joyful: { emoji: '🌸', bg: 'bg-[#fbeeed] text-[#b94a55] border-[#f4cfd3]' },
    Grateful: { emoji: '🌿', bg: 'bg-[#edf4ed] text-[#4d734e] border-[#cfdec0]' },
    Reflective: { emoji: '☕', bg: 'bg-[#f5eee6] text-[#785438] border-[#e2cfbd]' },
    Peaceful: { emoji: '🍃', bg: 'bg-[#edf4ed] text-[#4d734e] border-[#cfdec0]' },
    Romantic: { emoji: '♡', bg: 'bg-[#fbeeed] text-[#b94a55] border-[#f4cfd3]' },
    Nostalgic: { emoji: '🍂', bg: 'bg-[#f5eee6] text-[#785438] border-[#e2cfbd]' },
    Excited: { emoji: '⚡', bg: 'bg-[#fef7ea] text-[#966b2d] border-[#fae2be]' },
    Melancholy: { emoji: '🌧️', bg: 'bg-[#edf1f5] text-[#4e6a82] border-[#c8d6e3]' }
  };
  return map[mood] || { emoji: '♡', bg: 'bg-[#fbeeed] text-[#b94a55] border-[#f4cfd3]' };
};

export const MOOD_OPTIONS = [
  'Happier',
  'Grateful',
  'Reflective',
  'Peaceful',
  'Romantic',
  'Nostalgic',
  'Joyful',
  'Melancholy'
];
