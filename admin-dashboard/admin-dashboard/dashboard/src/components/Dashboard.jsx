import { useState, useEffect, useRef } from 'react';
import StatsCards from './StatsCards';
import ApplicationsTable from './ApplicationsTable';
import AcademicYearModal from './AcademicYearModal';
import UserManagement from './UserManagement';
import TopPerformers from './TopPerformers';

function Dashboard({ adminData, onLogout }) {
  const [stats, setStats] = useState({ total: 0, '10th': 0, '11th': 0, '12th': 0 });
  const [activeTab, setActiveTab] = useState('all');
  const [activeSection, setActiveSection] = useState('applications'); // 'applications', 'users', 'topperformers'
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [showYearModal, setShowYearModal] = useState(false);
  const [activeBoard, setActiveBoard] = useState('all');
  const [availableBoards, setAvailableBoards] = useState([]);
  const [showBoardDropdown, setShowBoardDropdown] = useState(false);
  const boardDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (boardDropdownRef.current && !boardDropdownRef.current.contains(e.target)) {
        setShowBoardDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchAcademicYear();
    if (activeSection === 'applications') {
      fetchPDFs();
    }
  }, [activeTab, activeSection]);

  const fetchAcademicYear = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/academic-year`);
      const data = await response.json();
      if (data.success) {
        setAcademicYear(data.academicYear);
      }
    } catch (error) {
      console.error('Error fetching academic year:', error);
    }
  };

  const fetchPDFs = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'all'
        ? `${import.meta.env.VITE_API_URL}/api/pdfs/all`
        : `${import.meta.env.VITE_API_URL}/api/pdfs/${activeTab}`;

      const response = await fetch(endpoint);
      const data = await response.json();

      if (data.success) {
        if (activeTab === 'all') {
          setPdfs(data.files);
          setStats({
            total: data.count,
            '10th': data.breakdown['10th'],
            '11th': data.breakdown['11th'],
            '12th': data.breakdown['12th'],
          });
        } else {
          setPdfs(data.files);
        }
        const boards = [...new Set(data.files.map(f => f.board).filter(Boolean))].sort();
        setAvailableBoards(boards);
      }
    } catch (error) {
      console.error('Error fetching PDFs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleYearUpdate = (newYear) => {
    setAcademicYear(newYear);
    setShowYearModal(false);
  };

  const formatAcademicYear = (year) => {
    if (!year) return '';
    const [startYear, endYear] = year.split('-');
    const fullEndYear = startYear.substring(0, 2) + endYear;
    return `${startYear} – ${fullEndYear}`;
  };

  const filteredPdfs = pdfs
    .filter(pdf => pdf.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(pdf => activeBoard === 'all' || pdf.board === activeBoard);

  const navTabs = [
    {
      key: 'applications',
      label: 'Applications',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      key: 'topperformers',
      label: 'Top Performers',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
    },
    {
      key: 'users',
      label: 'User Management',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen">
      {/* ── Header ──────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40"
        style={{
          background: 'rgba(5,5,5,0.85)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-0.5">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h1 className="text-lg font-semibold text-white tracking-tight">Admin Dashboard</h1>
              </div>
              {academicYear && (
                <p className="text-xs pl-12" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  AY {formatAcademicYear(academicYear)}
                </p>
              )}
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:block text-right mr-3">
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Signed in as</p>
                <p className="text-sm text-white/80 font-medium">{adminData?.name || adminData?.email}</p>
              </div>
              <button
                onClick={() => setShowYearModal(true)}
                className="btn-secondary px-3 py-2 rounded-lg text-xs"
              >
                Change Year
              </button>
              <button
                onClick={onLogout}
                className="btn-danger px-3 py-2 rounded-lg text-xs flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* ── Section navigation ── */}
          <div className="flex gap-1 mt-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {navTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveSection(tab.key)}
                className="relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors duration-200"
                style={{
                  color: activeSection === tab.key ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
                }}
              >
                {tab.icon}
                {tab.label}
                {activeSection === tab.key && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-px"
                    style={{ background: 'rgba(255,255,255,0.6)' }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Main content ────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeSection === 'applications' && (
          <>
            {/* Stats */}
            <StatsCards stats={stats} />

            {/* Applications section */}
            <div
              className="mt-8 rounded-2xl p-6"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <h2 className="text-lg font-semibold text-white mb-6 tracking-tight">Application Forms</h2>

              {/* Search */}
              <div className="relative mb-5">
                <input
                  type="text"
                  placeholder="Search by student name or file name…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-dark w-full px-4 py-3 pl-11 rounded-xl text-sm"
                />
                <svg
                  className="absolute left-3.5 top-3.5 w-4 h-4"
                  style={{ color: 'rgba(255,255,255,0.25)' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Filter tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                {['all', '10th', '11th', '12th'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => { setActiveTab(tab); setActiveBoard('all'); setShowBoardDropdown(false); }}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                    style={
                      activeTab === tab
                        ? {
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.18)',
                            color: 'rgba(255,255,255,0.9)',
                          }
                        : {
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            color: 'rgba(255,255,255,0.38)',
                          }
                    }
                  >
                    {tab === 'all' ? 'All' : `${tab} Std`}
                  </button>
                ))}

                {/* Board dropdown filter */}
                <div className="relative" ref={boardDropdownRef}>
                  <button
                    onClick={() => setShowBoardDropdown(prev => !prev)}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                    style={
                      activeBoard !== 'all'
                        ? {
                            background: 'rgba(167,139,250,0.15)',
                            border: '1px solid rgba(167,139,250,0.35)',
                            color: 'rgba(196,181,253,0.95)',
                          }
                        : {
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            color: 'rgba(255,255,255,0.38)',
                          }
                    }
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                    </svg>
                    {activeBoard === 'all' ? 'Board' : activeBoard}
                    <svg
                      className="w-3 h-3 transition-transform duration-150"
                      style={{ transform: showBoardDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showBoardDropdown && (
                    <div
                      className="absolute top-full left-0 mt-1 rounded-xl overflow-hidden z-20 min-w-max"
                      style={{
                        background: 'rgba(18,18,18,0.98)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                      }}
                    >
                      {['all', ...availableBoards].map((board) => (
                        <button
                          key={board}
                          onClick={() => { setActiveBoard(board); setShowBoardDropdown(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm transition-colors duration-150"
                          style={{
                            color: activeBoard === board ? 'rgba(196,181,253,0.95)' : 'rgba(255,255,255,0.6)',
                            background: activeBoard === board ? 'rgba(167,139,250,0.12)' : 'transparent',
                          }}
                          onMouseEnter={(e) => { if (activeBoard !== board) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                          onMouseLeave={(e) => { if (activeBoard !== board) e.currentTarget.style.background = 'transparent'; }}
                        >
                          {board === 'all' ? 'All Boards' : board}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={fetchPDFs}
                  className="btn-secondary ml-auto px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>

              <ApplicationsTable
                pdfs={filteredPdfs}
                loading={loading}
                searchTerm={searchTerm}
              />
            </div>
          </>
        )}

        {activeSection === 'topperformers' && (
          <TopPerformers adminData={adminData} />
        )}

        {activeSection === 'users' && (
          <UserManagement adminData={adminData} />
        )}
      </main>

      {/* Academic Year Modal */}
      {showYearModal && (
        <AcademicYearModal
          currentYear={academicYear}
          onClose={() => setShowYearModal(false)}
          onUpdate={handleYearUpdate}
        />
      )}
    </div>
  );
}

export default Dashboard;