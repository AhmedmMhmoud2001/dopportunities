import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../lib/api'
import { useAuth } from '../auth/auth_context'
import { PageShell } from '../components/page_shell'
import { IconPlus, IconSearch, IconEye, IconEdit, IconTrash, IconClose } from '../components/icons'
import { RichTextEditor } from '../components/rich_text_editor'

function Modal({ isOpen, onClose, onSubmit, isEditing, isLoading, initialData }) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    author: '',
    content: '',
    imageUrl: ''
  })
  const [imageFile, setImageFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        title: initialData.title || '',
        slug: initialData.slug || '',
        author: initialData.author || '',
        content: initialData.content || '',
        imageUrl: initialData.imageUrl || ''
      })
    } else {
      setFormData({ title: '', slug: '', author: '', content: '', imageUrl: '' })
    }
    setImageFile(null)
  }, [isEditing, initialData])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEditing ? 'تعديل مقال' : 'إضافة مقال جديد'}</h2>
          <button type="button" className="modal-close" onClick={onClose}>
            <IconClose size={18} />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData, imageFile) }}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">العنوان</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="أدخل عنوان المقالة"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">المسار (Slug)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="article-slug"
                  value={formData.slug}
                  onChange={e => setFormData({ ...formData, slug: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">المؤلف (اختياري)</label>
              <input
                type="text"
                className="form-input"
                placeholder="اسم المؤلف"
                value={formData.author}
                onChange={e => setFormData({ ...formData, author: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">الصورة (اختياري)</label>
              <div className="image-upload-area">
                {formData.imageUrl ? (
                  <div className="image-preview">
                    <img src={formData.imageUrl} alt="Preview" />
                    <button type="button" className="remove-image" onClick={() => setFormData({ ...formData, imageUrl: '' })}>
                      <IconX size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="image-input-row">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="أو أدخل رابط الصورة"
                      value={formData.imageUrl}
                      onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                    />
                    <label className="file-upload-btn">
                      رفع ملف
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => setImageFile(e.target.files?.[0] || null)}
                        hidden
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">المحتوى</label>
              <RichTextEditor
                value={formData.content}
                onChange={(html) => setFormData({ ...formData, content: html })}
                placeholder="أدخل محتوى المقالة..."
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              إلغاء
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'جارٍ...' : isEditing ? 'حفظ التغييرات' : 'نشر'}
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

export function BlogsPage() {
  const { token } = useAuth()
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedBlog, setSelectedBlog] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [blogToDelete, setBlogToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  async function refresh() {
    setError(null)
    setIsLoading(true)
    try {
      const data = await apiRequest('/v1/blogs?limit=50&offset=0')
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err?.message || 'فشل تحميل المقالات')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  const filteredBlogs = useMemo(() => {
    let result = [...items]
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(b => 
        b.title?.toLowerCase().includes(term) || 
        b.slug?.toLowerCase().includes(term)
      )
    }
    return result.sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt))
  }, [items, searchTerm])

  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage)
  const paginatedBlogs = filteredBlogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleAddBlog = () => {
    setIsEditing(false)
    setSelectedBlog(null)
    setIsModalOpen(true)
  }

  const handleEditBlog = (blog) => {
    setIsEditing(true)
    setSelectedBlog(blog)
    setIsModalOpen(true)
  }

  const handleDeleteBlog = (blog) => {
    setBlogToDelete(blog)
    setIsDeleteModalOpen(true)
  }

  const handleSubmit = async (formData, imageFile) => {
    setIsSubmitting(true)
    setError(null)
    try {
      let imageUrlToUse = formData.imageUrl || null
      
      if (!isEditing) {
        if (imageFile) {
          const form = new FormData()
          form.append('file', imageFile)
          const res = await fetch('/api/v1/uploads', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: form
          })
          const data = await res.json()
          if (res.ok) {
            imageUrlToUse = new URL(data.url, window.location.origin).toString()
          }
        }

        await apiRequest('/v1/blogs', {
          method: 'POST',
          token,
          body: {
            title: formData.title,
            slug: formData.slug,
            author: formData.author || null,
            content: formData.content,
            imageUrl: imageUrlToUse
          }
        })
      } else {
        await apiRequest(`/v1/blogs/${selectedBlog.id}`, {
          method: 'PUT',
          token,
          body: {
            title: formData.title,
            slug: formData.slug,
            author: formData.author || null,
            content: formData.content,
            imageUrl: imageUrlToUse
          }
        })
      }
      
      setIsModalOpen(false)
      await refresh()
    } catch (err) {
      setError(err?.message || 'فشل حفظ المقالة')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!blogToDelete) return
    setIsDeleting(true)
    try {
      await apiRequest(`/v1/blogs/${blogToDelete.id}`, { method: 'DELETE', token })
      setIsDeleteModalOpen(false)
      setBlogToDelete(null)
      await refresh()
    } catch (err) {
      setError(err?.message || 'فشل حذف المقالة')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <PageShell
      title="المدونات"
      subtitle={`${items.length} مقال`}
      right={
        <button type="button" className="btn btn-primary" onClick={handleAddBlog}>
          <IconPlus size={16} />
          إضافة مقال
        </button>
      }
    >
      <div className="blogs-page">
        {error && <div className="error-banner">{error}</div>}

        <div className="table-card">
          <div className="table-header">
            <div className="search-box">
              <IconSearch size={18} />
              <input
                type="text"
                placeholder="البحث بالعنوان أو المسار..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>

          <div className="table-container">
            {isLoading ? (
              <div className="loading-state">جارٍ التحميل...</div>
            ) : paginatedBlogs.length === 0 ? (
              <div className="empty-state">لا توجد مقالات</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>العنوان</th>
                    <th>المسار</th>
                    <th>المؤلف</th>
                    <th>تاريخ النشر</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBlogs.map(blog => (
                    <tr key={blog.id} className="table-row">
                      <td>
                        <div className="blog-title-cell">
                          {blog.imageUrl && <img src={blog.imageUrl} alt="" className="blog-thumb" />}
                          <span>{blog.title}</span>
                        </div>
                      </td>
                      <td className="table-cell">{blog.slug}</td>
                      <td className="table-cell">{blog.author || '—'}</td>
                      <td className="table-cell">
                        {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : '—'}
                      </td>
                      <td className="table-cell">
                        <div className="action-buttons">
                          <a href={`/blog/${blog.slug}`} target="_blank" rel="noopener noreferrer" className="action-btn" title="عرض">
                            <IconEye size={16} />
                          </a>
                          <button type="button" className="action-btn" onClick={() => handleEditBlog(blog)} title="تعديل">
                            <IconEdit size={16} />
                          </button>
                          <button type="button" className="action-btn action-delete" onClick={() => handleDeleteBlog(blog)} title="حذف">
                            <IconTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {!isLoading && filteredBlogs.length > 0 && (
            <div className="table-pagination">
              <span className="pagination-info">
                عرض {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredBlogs.length)} من {filteredBlogs.length}
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
        initialData={selectedBlog}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setBlogToDelete(null); }}
        onConfirm={handleConfirmDelete}
        title="حذف المقالة"
        message={`هل أنت متأكد من حذف "${blogToDelete?.title}"؟`}
        isLoading={isDeleting}
      />
    </PageShell>
  )
}