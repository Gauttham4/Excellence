import { useState } from 'react';

function AcademicYearModal({ currentYear, onClose, onUpdate }) {
  const [newYear, setNewYear] = useState(currentYear);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatAcademicYear = (year) => {
    if (!year) return '';
    const [startYear, endYear] = year.split('-');
    const fullEndYear = startYear.substring(0, 2) + endYear;
    return `${startYear} – ${fullEndYear}`;
  };

  const handleUpdate = async () => {
    setError('');

    const yearPattern = /^\d{4}-\d{2}$/;
    if (!yearPattern.test(newYear)) {
      setError('Invalid format. Use YYYY-YY (e.g. 2027-28)');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/academic-year`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ academicYear: newYear }),
      });

      const data = await response.json();

      if (data.success) {
        onUpdate(newYear);
      } else {
        setError(data.error || 'Failed to update academic year');
      }
    } catch (err) {
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-7 animate-fade-in-up"
        style={{
          background: '#0f0f0f',
          border: '1px solid rgba(255,255,255,0.08)',
          animationDelay: '60ms',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white tracking-tight">Update Academic Year</h3>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150"
            style={{ color: 'rgba(255,255,255,0.35)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Current year */}
        <div className="mb-5">
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Current Academic Year
          </label>
          <div
            className="px-4 py-2.5 rounded-xl text-sm"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.55)',
            }}
          >
            {formatAcademicYear(currentYear) || '—'}
          </div>
        </div>

        {/* New year input */}
        <div className="mb-5">
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.38)' }}>
            New Academic Year
          </label>
          <input
            type="text"
            value={newYear}
            onChange={(e) => setNewYear(e.target.value)}
            placeholder="e.g. 2027-28"
            className="input-dark w-full px-4 py-2.5 rounded-xl text-sm"
            disabled={loading}
          />
          <p className="text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.2)' }}>Format: YYYY-YY</p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="mb-5 px-4 py-3 rounded-xl text-xs animate-fade-in"
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: 'rgba(252,165,165,0.9)',
            }}
          >
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="btn-primary flex-1 py-2.5 rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full border border-black/20 border-t-black/70 animate-spin inline-block" />
                Updating…
              </span>
            ) : (
              'Update'
            )}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="btn-secondary flex-1 py-2.5 rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default AcademicYearModal;
