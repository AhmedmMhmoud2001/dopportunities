import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../lib/api'
import { useAuth } from '../auth/auth_context'
import { PageShell } from '../components/page_shell'
import { IconPlus, IconSearch, IconEye, IconEdit, IconTrash, IconClose, IconCheck } from '../components/icons'

function Modal({ isOpen, onClose, onSubmit, isEditing, isLoading, initialData }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    status: 'active'
  })

  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        password: '',
        role: initialData.role || 'user',
        status: initialData.status || 'active'
      })
    } else {
      setFormData({ name: '', email: '', password: '', role: 'user', status: 'active' })
    }
  }, [isEditing, initialData])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEditing ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}</h2>
          <button type="button" className="modal-close" onClick={onClose}>
            <IconClose size={18} />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData) }}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">الاسم</label>
              <input
                type="text"
                className="form-input"
                placeholder="أدخل الاسم"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">البريد الإلكتروني</label>
              <input
                type="email"
                className="form-input"
                placeholder="أدخل البريد الإلكتروني"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            {!isEditing && (
              <div className="form-group">
                <label className="form-label">كلمة المرور</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="أدخل كلمة المرور"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  required={!isEditing}
                />
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">الدور</label>
                <select
                  className="form-select"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="user">مستخدم</option>
                  <option value="admin">مسؤول</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">الحالة</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              إلغاء
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'جارٍ...' : isEditing ? 'حفظ التغييرات' : 'إضافة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ConfirmModal({ isOpen, onClose, onConfirm, title, message, isLoading }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
        </div>
        <div className="modal-body">
          <p className="confirm-message">{message}</p>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            إلغاء
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'جارٍ...' : 'حذف'}
          </button>
        </div>
      </div>
    </div>
  )
}

function UserRow({ user, onEdit, onDelete, onView }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const date = new Date(dateStr)
    return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <tr className="table-row">
      <td className="table-cell">
        <div className="user-info">
          <div className="user-avatar">{user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}</div>
          <span className="user-name">{user.name || '—'}</span>
        </div>
      </td>
      <td className="table-cell">{user.email}</td>
      <td className="table-cell">
        <span className={`badge badge-${user.role === 'admin' ? 'primary' : 'secondary'}`}>
          {user.role === 'admin' ? 'مسؤول' : 'مستخدم'}
        </span>
      </td>
      <td className="table-cell">
        <span className={`badge badge-${user.status === 'active' ? 'success' : 'muted'}`}>
          {user.status === 'active' ? 'نشط' : 'غير نشط'}
        </span>
      </td>
      <td className="table-cell">{formatDate(user.createdAt)}</td>
      <td className="table-cell">
        <div className="action-buttons">
          <button type="button" className="action-btn" onClick={() => onView(user)} title="عرض">
            <IconEye size={16} />
          </button>
          <button type="button" className="action-btn" onClick={() => onEdit(user)} title="تعديل">
            <IconEdit size={16} />
          </button>
          <button type="button" className="action-btn action-delete" onClick={() => onDelete(user)} title="حذف">
            <IconTrash size={16} />
          </button>
        </div>
      </td>
    </tr>
  )
}

export function UsersPage() {
  const { token } = useAuth()
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  async function refresh() {
    setError(null)
    setIsLoading(true)
    try {
      const data = await apiRequest('/v1/users', { token })
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err?.message || 'فشل تحميل المستخدمين')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  const filteredUsers = useMemo(() => {
    let result = [...items]
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(u => 
        u.name?.toLowerCase().includes(term) || 
        u.email?.toLowerCase().includes(term)
      )
    }
    if (roleFilter !== 'all') {
      result = result.filter(u => u.role === roleFilter)
    }
    return result.sort((a, b) => b.id - a.id)
  }, [items, searchTerm, roleFilter])

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleAddUser = () => {
    setIsEditing(false)
    setSelectedUser(null)
    setIsModalOpen(true)
  }

  const handleEditUser = (user) => {
    setIsEditing(true)
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleViewUser = (user) => {
    setIsEditing(true)
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleDeleteUser = (user) => {
    setUserToDelete(user)
    setIsDeleteModalOpen(true)
  }

  const handleSubmit = async (formData) => {
    setIsSubmitting(true)
    setError(null)
    try {
      if (isEditing) {
        await apiRequest(`/v1/users/${selectedUser.id}`, {
          method: 'PUT',
          token,
          body: {
            name: formData.name || undefined,
            role: formData.role,
            status: formData.status
          }
        })
      } else {
        await apiRequest('/v1/users', {
          method: 'POST',
          token,
          body: { email: formData.email, password: formData.password, name: formData.name || undefined, role: formData.role }
        })
      }
      setIsModalOpen(false)
      await refresh()
    } catch (err) {
      setError(err?.message || 'فشل حفظ المستخدم')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!userToDelete) return
    setIsDeleting(true)
    try {
      await apiRequest(`/v1/users/${userToDelete.id}`, { method: 'DELETE', token })
      setIsDeleteModalOpen(false)
      setUserToDelete(null)
      await refresh()
    } catch (err) {
      setError(err?.message || 'فشل حذف المستخدم')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <PageShell
      title="المستخدمون"
      subtitle={`${items.length} مستخدم`}
      right={
        <div className="page-actions">
          <button type="button" className="btn btn-primary" onClick={handleAddUser}>
            <IconPlus size={16} />
            إضافة مستخدم
          </button>
        </div>
      }
    >
      <div className="users-page">
        {error && <div className="error-banner">{error}</div>}

        <div className="table-card">
          <div className="table-header">
            <div className="search-box">
              <IconSearch size={18} />
              <input
                type="text"
                placeholder="البحث بالاسم أو البريد..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <select
              className="filter-select"
              value={roleFilter}
              onChange={e => { setRoleFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">كل الأدوار</option>
              <option value="user">مستخدم</option>
              <option value="admin">مسؤول</option>
            </select>
          </div>

          <div className="table-container">
            {isLoading ? (
              <div className="loading-state">جارٍ التحميل...</div>
            ) : paginatedUsers.length === 0 ? (
              <div className="empty-state">لا يوجد مستخدمون</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>الاسم</th>
                    <th>البريد الإلكتروني</th>
                    <th>الدور</th>
                    <th>الحالة</th>
                    <th>تاريخ الإنشاء</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map(user => (
                    <UserRow
                      key={user.id}
                      user={user}
                      onEdit={handleEditUser}
                      onView={handleViewUser}
                      onDelete={handleDeleteUser}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {!isLoading && filteredUsers.length > 0 && (
            <div className="table-pagination">
              <span className="pagination-info">
                عرض {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredUsers.length)} من {filteredUsers.length}
              </span>
              <div className="pagination-buttons">
                <button
                  type="button"
                  className="pagination-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  السابق
                </button>
                <span className="pagination-current">{currentPage} / {totalPages}</span>
                <button
                  type="button"
                  className="pagination-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  التالي
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        isEditing={isEditing}
        isLoading={isSubmitting}
        initialData={selectedUser}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setUserToDelete(null); }}
        onConfirm={handleConfirmDelete}
        title="حذف المستخدم"
        message={`هل أنت متأكد من حذف المستخدم "${userToDelete?.name || userToDelete?.email}"؟`}
        isLoading={isDeleting}
      />
    </PageShell>
  )
}