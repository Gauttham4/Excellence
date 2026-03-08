import { useState, useEffect } from 'react';
import RegisterUserModal from './RegisterUserModal';
import EditUserModal from './EditUserModal';

function UserManagement({ adminData }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let admin_creds = localStorage.getItem('admin_data');
      console.log(admin_creds);
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'adminEmail': adminData.email,
        },
      });

      const data = await response.json();
      console.log('Users data - ', data);
      if (data.success) {
        setUsers(data.users);
      } else {
        console.error('Failed to fetch users:', data.error);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId, userEmail) => {
    if (!confirm(`Are you sure you want to delete user: ${userEmail}?`)) {
      return;
    }

    setDeleteLoading(userId);
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'adminEmail': adminData.email,
        },
      });

      const data = await response.json();

      if (data.success) {
        setUsers(users.filter(user => user.id !== userId));
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleUserRegistered = (newUser) => {
    setUsers([newUser, ...users]);
    setShowRegisterModal(false);
  };

  const handleUserUpdated = (updatedUser) => {
    setUsers(users.map(user =>
      user.id === updatedUser.id ? { ...user, ...updatedUser } : user
    ));
    setShowEditModal(false);
    setSelectedUser(null);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp._seconds * 1000);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div
          className="w-8 h-8 rounded-full border animate-spin"
          style={{ borderColor: 'rgba(255,255,255,0.08)', borderTopColor: 'rgba(255,255,255,0.5)' }}
        />
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Loading users…</p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-6 animate-fade-in-up"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white tracking-tight">User Management</h2>
        <button
          onClick={() => setShowRegisterModal(true)}
          className="btn-primary px-4 py-2 rounded-lg text-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add User
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <input
          type="text"
          placeholder="Search by name or email…"
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

      {/* Meta */}
      <div
        className="flex items-center gap-2 mb-5 px-3 py-2.5 rounded-lg text-xs"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
      >
        <svg className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.35)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <span style={{ color: 'rgba(255,255,255,0.35)' }}>Total Users:</span>
        <span className="text-white font-medium">{filteredUsers.length}</span>
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['Name', 'Email', 'Created At', 'Created By', 'Actions'].map((col, i) => (
                <th
                  key={col}
                  className={`py-3 px-4 text-xs font-medium uppercase tracking-wider ${i === 4 ? 'text-center' : 'text-left'}`}
                  style={{ color: 'rgba(255,255,255,0.28)' }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-10 text-sm" style={{ color: 'rgba(255,255,255,0.28)' }}>
                  {searchTerm ? 'No users match your search' : 'No users registered yet'}
                </td>
              </tr>
            ) : (
              filteredUsers.map((user, index) => (
                <tr
                  key={user.id}
                  className="animate-fade-in-up"
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    animationDelay: `${index * 30}ms`,
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.025)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <td className="py-3.5 px-4 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    {user.name || <span style={{ color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>No name</span>}
                  </td>
                  <td className="py-3.5 px-4 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{user.email}</td>
                  <td className="py-3.5 px-4 text-xs" style={{ color: 'rgba(255,255,255,0.32)' }}>{formatDate(user.createdAt)}</td>
                  <td className="py-3.5 px-4 text-xs" style={{ color: 'rgba(255,255,255,0.32)' }}>{user.createdBy || 'N/A'}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-all duration-150"
                        style={{
                          background: 'rgba(96,165,250,0.08)',
                          border: '1px solid rgba(96,165,250,0.18)',
                          color: 'rgba(147,197,253,0.85)',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(96,165,250,0.15)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(96,165,250,0.08)'; }}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.id, user.email)}
                        disabled={deleteLoading === user.id || user.id === adminData.id}
                        className="btn-danger px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                        title={user.id === adminData.id ? 'Cannot delete yourself' : ''}
                      >
                        {deleteLoading === user.id ? (
                          <>
                            <span
                              className="w-3.5 h-3.5 rounded-full border inline-block animate-spin"
                              style={{ borderColor: 'rgba(252,165,165,0.2)', borderTopColor: 'rgba(252,165,165,0.7)' }}
                            />
                            Deleting…
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-10 text-sm" style={{ color: 'rgba(255,255,255,0.28)' }}>
            {searchTerm ? 'No users match your search' : 'No users registered yet'}
          </div>
        ) : (
          filteredUsers.map((user, index) => (
            <div
              key={user.id}
              className="rounded-xl p-4 animate-fade-in-up"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                animationDelay: `${index * 40}ms`,
              }}
            >
              <div className="mb-2">
                <h3 className="text-sm font-medium text-white mb-0.5">
                  {user.name || <span style={{ color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>No name</span>}
                </h3>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{user.email}</p>
              </div>
              <div className="space-y-0.5 mb-3">
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.28)' }}>Created: {formatDate(user.createdAt)}</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.28)' }}>By: {user.createdBy || 'N/A'}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(user)}
                  className="flex-1 px-3 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all duration-150"
                  style={{
                    background: 'rgba(96,165,250,0.08)',
                    border: '1px solid rgba(96,165,250,0.18)',
                    color: 'rgba(147,197,253,0.85)',
                  }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(user.id, user.email)}
                  disabled={deleteLoading === user.id || user.id === adminData.id}
                  className="btn-danger flex-1 px-3 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {deleteLoading === user.id ? (
                    <span
                      className="w-3.5 h-3.5 rounded-full border inline-block animate-spin"
                      style={{ borderColor: 'rgba(252,165,165,0.2)', borderTopColor: 'rgba(252,165,165,0.7)' }}
                    />
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      {showRegisterModal && (
        <RegisterUserModal
          adminData={adminData}
          onClose={() => setShowRegisterModal(false)}
          onUserRegistered={handleUserRegistered}
        />
      )}

      {showEditModal && selectedUser && (
        <EditUserModal
          adminData={adminData}
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onUserUpdated={handleUserUpdated}
        />
      )}
    </div>
  );
}

export default UserManagement;
