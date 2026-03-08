function ApplicationsTable({ pdfs, loading, searchTerm }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(2)} KB` : `${mb.toFixed(2)} MB`;
  };

  const handleDownload = async (pdf) => {
    try {
      window.open(pdf.webViewLink, '_blank');
    } catch (error) {
      console.error('Error opening PDF:', error);
    }
  };


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div
          className="w-8 h-8 rounded-full border animate-spin"
          style={{ borderColor: 'rgba(255,255,255,0.08)', borderTopColor: 'rgba(255,255,255,0.5)' }}
        />
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Loading applications…</p>
      </div>
    );
  }

  if (pdfs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <svg className="w-6 h-6" style={{ color: 'rgba(255,255,255,0.25)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {searchTerm ? 'No applications match your search' : 'No applications yet'}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['File Name', 'Submitted On', 'Size', 'Actions'].map((col, i) => (
                <th
                  key={col}
                  className={`py-3 px-4 text-xs font-medium uppercase tracking-wider ${i === 3 ? 'text-center' : 'text-left'}`}
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pdfs.map((pdf, index) => (
              <tr
                key={pdf.id || index}
                className="animate-fade-in-up"
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  animationDelay: `${index * 30}ms`,
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.025)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <td className="py-3.5 px-4 text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>{pdf.name}</td>
                <td className="py-3.5 px-4 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {formatDate(pdf.createdTime)}
                </td>
                <td className="py-3.5 px-4 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {formatFileSize(pdf.size)}
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => handleDownload(pdf)}
                      className="btn-secondary px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View PDF
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-3">
        {pdfs.map((pdf, index) => (
          <div
            key={pdf.id || index}
            className="rounded-xl p-4 animate-fade-in-up"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              animationDelay: `${index * 40}ms`,
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm font-medium text-white flex-1 leading-snug">{pdf.name}</h3>
            </div>
            <div className="space-y-1 mb-3">
              <p className="text-xs flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(pdf.createdTime)}
              </p>
              <p className="text-xs flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                {formatFileSize(pdf.size)}
              </p>
            </div>
            <button
              onClick={() => handleDownload(pdf)}
              className="btn-secondary w-full px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View PDF
            </button>
          </div>
        ))}
      </div>

      {/* Count */}
      <div className="mt-5 text-center text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
        {pdfs.length} {pdfs.length === 1 ? 'application' : 'applications'}
      </div>
    </>
  );
}

export default ApplicationsTable;
