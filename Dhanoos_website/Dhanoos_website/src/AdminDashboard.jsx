import { useState } from 'react';
import './AdminDashboard.css';

const mockStudents = [
  {
    id: 1,
    applicationNo: 'SA2025ABC123',
    studentName: 'Rajesh Kumar',
    std: '10th',
    gender: 'Male',
    dob: '2010-05-15',
    board: 'CBSE',
    school: 'Bharathi Senior Secondary School',
    subjects: 'Maths, Science',
    fatherName: 'Kumar Sharma',
    motherName: 'Priya Sharma',
    cellNo: '9876543210',
    email: 'rajesh@example.com',
    submittedDate: '2025-02-01'
  },
  {
    id: 2,
    applicationNo: 'SA2025XYZ456',
    studentName: 'Priya Sharma',
    std: '11th',
    gender: 'Female',
    dob: '2009-08-22',
    board: 'State Board',
    school: 'Kendriya Vidyalaya',
    subjects: 'Maths',
    fatherName: 'Sharma Singh',
    motherName: 'Anita Sharma',
    cellNo: '9876543211',
    email: 'priya@example.com',
    submittedDate: '2025-02-02'
  },
  {
    id: 3,
    applicationNo: 'SA2025PQR789',
    studentName: 'Arun Krishnan',
    std: '12th',
    gender: 'Male',
    dob: '2008-11-10',
    board: 'ICSE',
    school: 'Holy Angels School',
    subjects: 'Science',
    fatherName: 'Krishnan Nair',
    motherName: 'Lakshmi Nair',
    cellNo: '9876543212',
    email: 'arun@example.com',
    submittedDate: '2025-02-03'
  }
];

function AdminDashboard() {
  const [currentView, setCurrentView] = useState('overview');
  const [students] = useState(mockStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStd, setFilterStd] = useState('all');

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        student.applicationNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStd === 'all' || student.std === filterStd;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    totalStudents: students.length,
    std10: students.filter(s => s.std === '10th').length,
    std11: students.filter(s => s.std === '11th').length,
    std12: students.filter(s => s.std === '12th').length
  };

  return (
    <div className="admin-container">
      <div className="sidebar">
        <h1 className="font-display text-2xl font-bold gradient-text mb-8">Success Academy</h1>
        <nav>
          <div 
            className={`sidebar-item ${currentView === 'overview' ? 'active' : ''}`}
            onClick={() => setCurrentView('overview')}
          >
            📊 Overview
          </div>
          <div 
            className={`sidebar-item ${currentView === 'students' ? 'active' : ''}`}
            onClick={() => setCurrentView('students')}
          >
            👥 All Students
          </div>
          <div 
            className={`sidebar-item ${currentView === 'analytics' ? 'active' : ''}`}
            onClick={() => setCurrentView('analytics')}
          >
            📈 Analytics
          </div>
          <div 
            className={`sidebar-item ${currentView === 'settings' ? 'active' : ''}`}
            onClick={() => setCurrentView('settings')}
          >
            ⚙️ Settings
          </div>
        </nav>
        <div className="mt-auto pt-8">
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full btn btn-danger"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      <div className="main-content">
        {currentView === 'overview' && <OverviewView stats={stats} students={students} />}
        {currentView === 'students' && (
          <StudentsView 
            students={filteredStudents}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStd={filterStd}
            setFilterStd={setFilterStd}
          />
        )}
        {currentView === 'analytics' && <AnalyticsView stats={stats} students={students} />}
        {currentView === 'settings' && <SettingsView />}
      </div>
    </div>
  );
}

function OverviewView({ stats, students }) {
  return (
    <div>
      <h2 className="text-4xl font-display font-bold gradient-text mb-8">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="stat-card">
          <div className="text-gray-400 text-sm mb-2">Total Students</div>
          <div className="text-4xl font-bold text-white">{stats.totalStudents}</div>
        </div>
        <div className="stat-card">
          <div className="text-gray-400 text-sm mb-2">10th Standard</div>
          <div className="text-4xl font-bold text-white">{stats.std10}</div>
        </div>
        <div className="stat-card">
          <div className="text-gray-400 text-sm mb-2">11th Standard</div>
          <div className="text-4xl font-bold text-white">{stats.std11}</div>
        </div>
        <div className="stat-card">
          <div className="text-gray-400 text-sm mb-2">12th Standard</div>
          <div className="text-4xl font-bold text-white">{stats.std12}</div>
        </div>
      </div>
      <div className="glass-card p-8 rounded-2xl">
        <h3 className="text-2xl font-semibold text-white mb-6">Recent Applications</h3>
        <div className="space-y-4">
          {students.slice(0, 5).map(student => (
            <div key={student.id} className="flex justify-between items-center p-4 rounded-lg bg-black bg-opacity-20">
              <div>
                <div className="text-white font-semibold">{student.studentName}</div>
                <div className="text-gray-400 text-sm">{student.std} • {student.school}</div>
              </div>
              <div className="text-right">
                <div className="text-gray-400 text-sm">{student.applicationNo}</div>
                <div className="text-gray-500 text-xs">{student.submittedDate}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StudentsView({ students, searchTerm, setSearchTerm, filterStd, setFilterStd }) {
  return (
    <div>
      <h2 className="text-4xl font-display font-bold gradient-text mb-8">All Students</h2>
      <div className="glass-card p-6 rounded-2xl mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            type="text" 
            placeholder="Search by name or application no..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
          />
          <select 
            value={filterStd}
            onChange={(e) => setFilterStd(e.target.value)}
            className="input-field"
          >
            <option value="all">All Standards</option>
            <option value="10th">10th Standard</option>
            <option value="11th">11th Standard</option>
            <option value="12th">12th Standard</option>
          </select>
        </div>
      </div>
      <div className="glass-card p-8 rounded-2xl overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left py-4 px-4 text-gray-400">Application No</th>
              <th className="text-left py-4 px-4 text-gray-400">Name</th>
              <th className="text-left py-4 px-4 text-gray-400">Standard</th>
              <th className="text-left py-4 px-4 text-gray-400">School</th>
              <th className="text-left py-4 px-4 text-gray-400">Contact</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id} className="border-t border-gray-800">
                <td className="py-4 px-4 text-gray-300 font-mono text-sm">{s.applicationNo}</td>
                <td className="py-4 px-4 text-white font-semibold">{s.studentName}</td>
                <td className="py-4 px-4 text-gray-300">{s.std}</td>
                <td className="py-4 px-4 text-gray-400 text-sm">{s.school}</td>
                <td className="py-4 px-4 text-gray-400">{s.cellNo}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {students.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No students found matching your criteria
          </div>
        )}
      </div>
    </div>
  );
}

function AnalyticsView({ stats, students }) {
  const boardDistribution = {
    CBSE: students.filter(s => s.board === 'CBSE').length,
    'State Board': students.filter(s => s.board === 'State Board').length,
    ICSE: students.filter(s => s.board === 'ICSE').length
  };

  return (
    <div>
      <h2 className="text-4xl font-display font-bold gradient-text mb-8">Analytics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8 rounded-2xl">
          <h3 className="text-2xl font-semibold text-white mb-6">Board Distribution</h3>
          <div className="space-y-4">
            {Object.entries(boardDistribution).map(([board, count]) => (
              <div key={board}>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300">{board}</span>
                  <span className="text-white font-semibold">{count}</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-white to-gray-400 h-2 rounded-full"
                    style={{ width: `${(count / students.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card p-8 rounded-2xl">
          <h3 className="text-2xl font-semibold text-white mb-6">Gender Distribution</h3>
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text mb-2">
                {students.filter(s => s.gender === 'Male').length}
              </div>
              <div className="text-gray-400">Male</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text mb-2">
                {students.filter(s => s.gender === 'Female').length}
              </div>
              <div className="text-gray-400">Female</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsView() {
  const [settings, setSettings] = useState({
    instituteName: 'Success Academy',
    address: 'No: 18A, 6TH CROSS STREET, KUMARAN NAGAR, LAWSPET, PUDUCHERRY - 605008',
    phone1: '8428439904',
    phone2: '8668068109',
    phone3: '9443638914',
    email: 'info@successacademy.com'
  });

  return (
    <div>
      <h2 className="text-4xl font-display font-bold gradient-text mb-8">Settings</h2>
      <div className="glass-card p-8 rounded-2xl">
        <h3 className="text-2xl font-semibold text-white mb-6">Institute Information</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-gray-300 mb-2">Institute Name</label>
            <input 
              type="text"
              value={settings.instituteName}
              onChange={(e) => setSettings({...settings, instituteName: e.target.value})}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Address</label>
            <textarea 
              rows="3"
              value={settings.address}
              onChange={(e) => setSettings({...settings, address: e.target.value})}
              className="input-field"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Phone 1</label>
              <input 
                type="tel"
                value={settings.phone1}
                onChange={(e) => setSettings({...settings, phone1: e.target.value})}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Phone 2</label>
              <input 
                type="tel"
                value={settings.phone2}
                onChange={(e) => setSettings({...settings, phone2: e.target.value})}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Phone 3</label>
              <input 
                type="tel"
                value={settings.phone3}
                onChange={(e) => setSettings({...settings, phone3: e.target.value})}
                className="input-field"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Email</label>
            <input 
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({...settings, email: e.target.value})}
              className="input-field"
            />
          </div>
          <button 
            onClick={() => alert('Settings saved!')}
            className="btn-primary"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;