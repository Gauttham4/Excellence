import { useState, useEffect } from 'react';

const STANDARDS = ['10th', '11th', '12th'];

const s = {
  root: { color: '#f5f4f0', fontFamily: "'DM Sans', sans-serif" },
  title: { fontFamily: "'Barlow Condensed', sans-serif", fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.01em', color: '#f5f4f0', marginBottom: '1.75rem', lineHeight: 1 },
  titleAccent: { color: '#2563ff' },
  tabRow: { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  tab: (active) => ({
    padding: '0.625rem 1.25rem',
    background: active ? '#f5f4f0' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${active ? '#f5f4f0' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: '3px',
    color: active ? '#0d0d0d' : '#7a7972',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
  }),
  addBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    background: '#f5f4f0', color: '#0d0d0d',
    border: 'none', borderRadius: '3px',
    fontFamily: "'DM Sans', sans-serif", fontSize: '0.9375rem', fontWeight: 700,
    cursor: 'pointer', marginBottom: '1.5rem',
    transition: 'background 0.15s',
  },
  formPanel: {
    background: '#111111',
    border: '1px solid rgba(37,99,255,0.3)',
    borderRadius: '4px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  formTitle: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase',
    color: '#f5f4f0', marginBottom: '1.25rem', letterSpacing: '0.02em',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '1rem',
  },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '0.375rem' },
  label: {
    fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.06em',
    textTransform: 'uppercase', color: '#7a7972',
  },
  input: {
    width: '100%', padding: '0.75rem 0.875rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderBottom: '2px solid rgba(255,255,255,0.15)',
    borderRadius: '3px',
    color: '#f5f4f0',
    fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem',
    outline: 'none', transition: 'border-color 0.15s',
    boxSizing: 'border-box',
  },
  inputErr: {
    borderBottom: '2px solid #e63c3c',
  },
  errMsg: { fontSize: '0.75rem', color: '#e63c3c', marginTop: '2px' },
  formActions: { display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' },
  saveBtn: (disabled) => ({
    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    background: disabled ? 'rgba(255,255,255,0.2)' : '#f5f4f0',
    color: '#0d0d0d', border: 'none', borderRadius: '3px',
    fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: 'background 0.15s',
  }),
  cancelBtn: {
    display: 'inline-flex', alignItems: 'center',
    padding: '0.75rem 1.25rem',
    background: 'rgba(220,38,38,0.1)', color: '#fca5a5',
    border: '1px solid rgba(220,38,38,0.25)', borderRadius: '3px',
    fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', fontWeight: 600,
    cursor: 'pointer',
  },
  tablePanel: {
    background: '#111111',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left', padding: '0.875rem 1rem',
    fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em',
    textTransform: 'uppercase', color: '#7a7972',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    whiteSpace: 'nowrap',
  },
  td: { padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.9rem', verticalAlign: 'middle' },
  tdName: { fontWeight: 600, color: '#f5f4f0' },
  tdSchool: { color: '#7a7972', fontSize: '0.85rem' },
  tdMeta: { color: '#c8c7c0' },
  tdScore: { fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.2rem', fontWeight: 900, color: '#2563ff' },
  deleteBtn: (loading) => ({
    background: 'rgba(220,38,38,0.1)', color: '#fca5a5',
    border: '1px solid rgba(220,38,38,0.25)', borderRadius: '3px',
    padding: '0.375rem 0.75rem', fontSize: '0.8rem',
    cursor: loading ? 'not-allowed' : 'pointer',
    fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
    opacity: loading ? 0.5 : 1,
    whiteSpace: 'nowrap',
  }),
  empty: { padding: '3rem', textAlign: 'center', color: '#3a3935', fontSize: '0.9rem' },
  loadingText: { padding: '2rem', textAlign: 'center', color: '#7a7972', fontSize: '0.9rem' },
};

function TopPerformers({ adminData }) {
  const [activeStd, setActiveStd] = useState('10th');
  const [performers, setPerformers] = useState({ '10th': [], '11th': [], '12th': [] });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', school: '', maths: '', science: '', physics: '', chemistry: '', total: '',
    year: new Date().getFullYear().toString(),
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => { fetchPerformers(); }, []);

  const fetchPerformers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/top-performers`);
      const data = await res.json();
      if (data.success) {
        const grouped = { '10th': [], '11th': [], '12th': [] };
        data.performers.forEach(p => { if (grouped[p.std]) grouped[p.std].push(p); });
        setPerformers(grouped);
      }
    } catch (err) {
      console.error('Error fetching performers:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const e = {};
    if (!formData.name.trim()) e.name = 'Required';
    if (!formData.school.trim()) e.school = 'Required';
    if (!formData.year.trim() || !/^\d{4}$/.test(formData.year)) e.year = '4-digit year';
    if (!formData.total.trim()) e.total = 'Required';
    if (!formData.maths.trim()) e.maths = 'Required';
    if (activeStd === '10th') {
      if (!formData.science.trim()) e.science = 'Required';
    } else {
      if (!formData.physics.trim()) e.physics = 'Required';
      if (!formData.chemistry.trim()) e.chemistry = 'Required';
    }
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const payload = {
        std: activeStd,
        name: formData.name.trim(),
        school: formData.school.trim(),
        year: formData.year.trim(),
        total: formData.total.trim(),
        maths: formData.maths.trim(),
        ...(activeStd === '10th'
          ? { science: formData.science.trim() }
          : { physics: formData.physics.trim(), chemistry: formData.chemistry.trim() }),
      };
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/top-performers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', adminemail: adminData?.email || '' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setFormData({ name: '', school: '', maths: '', science: '', physics: '', chemistry: '', total: '', year: new Date().getFullYear().toString() });
        setFormErrors({});
        fetchPerformers();
      } else {
        alert('Failed to add: ' + data.error);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this performer?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/top-performers/${id}`, {
        method: 'DELETE',
        headers: { adminemail: adminData?.email || '' },
      });
      const data = await res.json();
      if (data.success) fetchPerformers();
      else alert('Failed to delete: ' + data.error);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const fc = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFormErrors(prev => ({ ...prev, [field]: '' }));
  };

  const openForm = () => {
    setFormData({ name: '', school: '', maths: '', science: '', physics: '', chemistry: '', total: '', year: new Date().getFullYear().toString() });
    setFormErrors({});
    setShowForm(true);
  };

  const currentList = performers[activeStd] || [];

  return (
    <div style={s.root}>
      <h2 style={s.title}>Top <span style={s.titleAccent}>Performers</span></h2>

      {/* Standard tabs */}
      <div style={s.tabRow}>
        {STANDARDS.map(std => (
          <button key={std} style={s.tab(activeStd === std)}
            onClick={() => { setActiveStd(std); setShowForm(false); setFormErrors({}); }}>
            {std} Standard
          </button>
        ))}
      </div>

      {/* Add button */}
      <button style={s.addBtn} onClick={openForm}>
        + Add {activeStd} Performer
      </button>

      {/* Add form */}
      {showForm && (
        <div style={s.formPanel}>
          <div style={s.formTitle}>Add Performer — {activeStd} Standard</div>
          <div style={s.formGrid}>
            {/* Name */}
            <div style={s.fieldGroup}>
              <label style={s.label}>Student Name *</label>
              <input style={{ ...s.input, ...(formErrors.name ? s.inputErr : {}) }}
                type="text" value={formData.name} onChange={e => fc('name', e.target.value)} placeholder="Full name" />
              {formErrors.name && <span style={s.errMsg}>{formErrors.name}</span>}
            </div>
            {/* School */}
            <div style={s.fieldGroup}>
              <label style={s.label}>School *</label>
              <input style={{ ...s.input, ...(formErrors.school ? s.inputErr : {}) }}
                type="text" value={formData.school} onChange={e => fc('school', e.target.value)} placeholder="School name" />
              {formErrors.school && <span style={s.errMsg}>{formErrors.school}</span>}
            </div>
            {/* Year */}
            <div style={s.fieldGroup}>
              <label style={s.label}>Year *</label>
              <input style={{ ...s.input, ...(formErrors.year ? s.inputErr : {}) }}
                type="text" value={formData.year} onChange={e => fc('year', e.target.value)} placeholder="e.g. 2024" maxLength={4} />
              {formErrors.year && <span style={s.errMsg}>{formErrors.year}</span>}
            </div>
            {/* Maths */}
            <div style={s.fieldGroup}>
              <label style={s.label}>Maths Mark *</label>
              <input style={{ ...s.input, ...(formErrors.maths ? s.inputErr : {}) }}
                type="text" value={formData.maths} onChange={e => fc('maths', e.target.value)} placeholder="e.g. 98" />
              {formErrors.maths && <span style={s.errMsg}>{formErrors.maths}</span>}
            </div>
            {/* Science / Physics+Chemistry */}
            {activeStd === '10th' ? (
              <div style={s.fieldGroup}>
                <label style={s.label}>Science Mark *</label>
                <input style={{ ...s.input, ...(formErrors.science ? s.inputErr : {}) }}
                  type="text" value={formData.science} onChange={e => fc('science', e.target.value)} placeholder="e.g. 95" />
                {formErrors.science && <span style={s.errMsg}>{formErrors.science}</span>}
              </div>
            ) : (
              <>
                <div style={s.fieldGroup}>
                  <label style={s.label}>Physics Mark *</label>
                  <input style={{ ...s.input, ...(formErrors.physics ? s.inputErr : {}) }}
                    type="text" value={formData.physics} onChange={e => fc('physics', e.target.value)} placeholder="e.g. 95" />
                  {formErrors.physics && <span style={s.errMsg}>{formErrors.physics}</span>}
                </div>
                <div style={s.fieldGroup}>
                  <label style={s.label}>Chemistry Mark *</label>
                  <input style={{ ...s.input, ...(formErrors.chemistry ? s.inputErr : {}) }}
                    type="text" value={formData.chemistry} onChange={e => fc('chemistry', e.target.value)} placeholder="e.g. 92" />
                  {formErrors.chemistry && <span style={s.errMsg}>{formErrors.chemistry}</span>}
                </div>
              </>
            )}
            {/* Total */}
            <div style={s.fieldGroup}>
              <label style={s.label}>Total / Percentage *</label>
              <input style={{ ...s.input, ...(formErrors.total ? s.inputErr : {}) }}
                type="text" value={formData.total} onChange={e => fc('total', e.target.value)} placeholder="e.g. 98.5%" />
              {formErrors.total && <span style={s.errMsg}>{formErrors.total}</span>}
            </div>
          </div>

          <div style={s.formActions}>
            <button style={s.saveBtn(submitting)} onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Performer'}
            </button>
            <button style={s.cancelBtn} onClick={() => { setShowForm(false); setFormErrors({}); }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={s.tablePanel}>
        {loading ? (
          <div style={s.loadingText}>Loading...</div>
        ) : currentList.length === 0 ? (
          <div style={s.empty}>No top performers added for {activeStd} standard yet.</div>
        ) : (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Name</th>
                  <th style={s.th}>School</th>
                  <th style={s.th}>Year</th>
                  <th style={s.th}>Maths</th>
                  {activeStd === '10th'
                    ? <th style={s.th}>Science</th>
                    : <><th style={s.th}>Physics</th><th style={s.th}>Chemistry</th></>
                  }
                  <th style={s.th}>Total / %</th>
                  <th style={s.th}></th>
                </tr>
              </thead>
              <tbody>
                {currentList.map(p => (
                  <tr key={p.id} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ ...s.td, ...s.tdName }}>{p.name}</td>
                    <td style={{ ...s.td, ...s.tdSchool }}>{p.school}</td>
                    <td style={{ ...s.td, ...s.tdMeta }}>{p.year}</td>
                    <td style={{ ...s.td, ...s.tdMeta }}>{p.maths}</td>
                    {activeStd === '10th'
                      ? <td style={{ ...s.td, ...s.tdMeta }}>{p.science}</td>
                      : <><td style={{ ...s.td, ...s.tdMeta }}>{p.physics}</td><td style={{ ...s.td, ...s.tdMeta }}>{p.chemistry}</td></>
                    }
                    <td style={{ ...s.td, ...s.tdScore }}>{p.total}</td>
                    <td style={s.td}>
                      <button style={s.deleteBtn(deletingId === p.id)}
                        onClick={() => handleDelete(p.id)} disabled={deletingId === p.id}>
                        {deletingId === p.id ? '...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default TopPerformers;