import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../contexts/AuthContext'
import { getUsers, updateUser, deleteUser, getCompanies } from '../services/supabaseService'
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Loader2,
  RefreshCw,
  Shield,
  User,
} from 'lucide-react'
import toast from 'react-hot-toast'

function UserModal({ isOpen, onClose, onSubmit, onCreateNew, user, companies, loading }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const isNew = !user

  useEffect(() => {
    if (user) {
      reset({ name: user.name, role: user.role, assigned_companies: user.assigned_companies || [] })
    } else {
      reset({ name: '', email: '', password: '', role: 'staff', assigned_companies: [] })
    }
  }, [user, isOpen])

  if (!isOpen) return null

  const inputCls = "w-full rounded-lg border border-white/10 bg-[#202020] px-3 py-2.5 text-sm text-white outline-none placeholder:text-[#888] focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]"
  const labelCls = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#888]"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/10 bg-[#181818] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="text-lg font-bold text-white">
            {isNew ? 'Tambah User Staff' : 'Edit User'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#888] hover:bg-white/10 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit(isNew ? onCreateNew : onSubmit)} className="p-6 space-y-4">
          <div>
            <label className={labelCls}>Nama Lengkap *</label>
            <input type="text" placeholder="Nama Staff" className={inputCls}
              {...register('name', { required: 'Nama wajib diisi' })} />
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
          </div>
          {isNew && (
            <>
              <div>
                <label className={labelCls}>Email *</label>
                <input type="email" placeholder="staff@perusahaan.com" className={inputCls}
                  {...register('email', { required: 'Email wajib diisi', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email tidak valid' } })} />
                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
              </div>
              <div>
                <label className={labelCls}>Password *</label>
                <input type="password" placeholder="Min 6 karakter" className={inputCls}
                  {...register('password', { required: 'Password wajib diisi', minLength: { value: 6, message: 'Min 6 karakter' } })} />
                {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
              </div>
            </>
          )}
          <div>
            <label className={labelCls}>Role</label>
            <select className={inputCls} {...register('role')}>
              <option value="staff" className="bg-[#181818]">Staff</option>
              <option value="admin" className="bg-[#181818]">Admin</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Perusahaan yang Ditugaskan</label>
            <div className="max-h-40 overflow-y-auto rounded-lg border border-white/10 bg-[#202020] p-2">
              {companies.length === 0 ? (
                <p className="py-2 text-center text-xs text-[#888]">Belum ada perusahaan</p>
              ) : (
                companies.map((c) => (
                  <label key={c.id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-white/5">
                    <input type="checkbox" value={c.id} className="rounded border-white/20 accent-[#C9A84C]"
                      {...register('assigned_companies')} />
                    <span className="text-sm text-white">{c.name}</span>
                  </label>
                ))
              )}
            </div>
            <p className="mt-1 text-xs text-[#888]">Staff hanya bisa lihat perusahaan yang ditugaskan. Admin lihat semua.</p>
          </div>
          <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-[#c8c8c8] hover:bg-white/5 hover:text-white">
              Batal
            </button>
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-[#C9A84C] px-5 py-2 text-sm font-bold text-[#0f0f0f] hover:opacity-90 disabled:opacity-60">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isNew ? 'Buat User' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function UsersPage() {
  const { createStaffUser, currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  async function loadData() {
    setLoading(true)
    try {
      const [usersData, companiesData] = await Promise.all([getUsers(), getCompanies()])
      setUsers(usersData)
      setCompanies(companiesData)
    } catch {
      toast.error('Gagal memuat data user')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  async function handleCreateUser(data) {
    setSaving(true)
    try {
      await createStaffUser(data.email, data.password, data.name, data.assigned_companies || [])
      toast.success('User staff berhasil dibuat')
      setShowModal(false)
      loadData()
    } catch (err) {
      toast.error(err.code === 'auth/email-already-in-use' ? 'Email sudah digunakan' : 'Gagal membuat user')
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdateUser(data) {
    setSaving(true)
    try {
      await updateUser(editingUser.id, { name: data.name, role: data.role, assigned_companies: data.assigned_companies || [] })
      toast.success('User diperbarui')
      setShowModal(false)
      setEditingUser(null)
      loadData()
    } catch {
      toast.error('Update gagal')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteUser(uid) {
    try {
      await deleteUser(uid)
      toast.success('User dihapus')
      setDeleteConfirm(null)
      loadData()
    } catch {
      toast.error('Hapus gagal')
    }
  }

  function getCompanyNames(ids = []) {
    if (!ids.length) return 'Semua perusahaan'
    return ids.map((id) => companies.find((c) => c.id === id)?.name || id).join(', ')
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">User Management</h2>
            <p className="mt-0.5 text-sm text-[#888]">{users.length} user terdaftar</p>
          </div>
          <div className="flex gap-2">
            <button onClick={loadData}
              className="rounded-lg border border-white/10 p-2 text-[#888] hover:bg-white/5 hover:text-white">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => { setEditingUser(null); setShowModal(true) }}
              className="flex items-center gap-1.5 rounded-lg bg-[#C9A84C] px-4 py-2 text-sm font-bold text-[#0f0f0f] hover:opacity-90">
              <Plus className="h-4 w-4" /> Tambah User
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-[#C9A84C]" />
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-[#181818] overflow-hidden shadow-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-[#202020]">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#C9A84C]">User</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#C9A84C]">Email</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#C9A84C]">Role</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#C9A84C]">Perusahaan</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#C9A84C]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                          user.role === 'admin' ? 'bg-[rgba(201,168,76,0.15)] text-[#C9A84C]' : 'bg-white/10 text-white'
                        }`}>
                          {user.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span className="font-medium text-white">{user.name}</span>
                        {user.id === currentUser?.uid && (
                          <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-blue-400">Anda</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#c8c8c8]">{user.email}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        user.role === 'admin' ? 'bg-[rgba(201,168,76,0.15)] text-[#C9A84C]' : 'bg-white/10 text-[#c8c8c8]'
                      }`}>
                        {user.role === 'admin' ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-[#c8c8c8] max-w-xs truncate">
                      {user.role === 'admin' ? (
                        <span className="text-[#C9A84C] font-medium">Semua perusahaan</span>
                      ) : (
                        getCompanyNames(user.assigned_companies)
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditingUser(user); setShowModal(true) }}
                          className="rounded p-1.5 text-[#888] hover:bg-[rgba(201,168,76,0.15)] hover:text-[#C9A84C]">
                          <Pencil className="h-4 w-4" />
                        </button>
                        {user.id !== currentUser?.uid && (
                          <button onClick={() => setDeleteConfirm(user)}
                            className="rounded p-1.5 text-[#888] hover:bg-red-500/20 hover:text-red-400">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UserModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingUser(null) }}
        onSubmit={handleUpdateUser}
        onCreateNew={handleCreateUser}
        user={editingUser}
        companies={companies}
        loading={saving}
      />

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setDeleteConfirm(null)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-[#181818] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Hapus User?</h3>
            <p className="mt-2 text-sm text-[#c8c8c8]">
              Ini akan menghapus record Firestore milik <strong className="text-white">{deleteConfirm.name}</strong>.
              Akun Firebase Auth harus dihapus manual via Firebase Console.
            </p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 rounded-lg border border-white/10 py-2 text-sm font-medium text-[#c8c8c8] hover:bg-white/5">
                Batal
              </button>
              <button onClick={() => handleDeleteUser(deleteConfirm.id)}
                className="flex-1 rounded-lg bg-red-500/80 py-2 text-sm font-bold text-white hover:bg-red-500">
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
