'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface UserPermissions {
  email: string
  name: string
  modules: {
    ipAssistant: boolean
    imageGeneration: boolean
    workflow: boolean
    assets: boolean
  }
  credits: number
  expiresAt: string | null
  createdAt: string
  updatedAt: string
}

export default function AdminPage() {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [users, setUsers] = useState<UserPermissions[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UserPermissions | null>(null)

  // 新用户表单
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    modules: {
      ipAssistant: false,
      imageGeneration: false,
      workflow: false,
      assets: false,
    },
    credits: 0,
    expiresAt: '',
  })

  // 检查管理员密码
  const handleLogin = async () => {
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === 'admin123') {
      setAuthenticated(true)
      localStorage.setItem('admin_auth', 'true')
      loadUsers()
    } else {
      alert('密码错误')
    }
  }

  // 加载用户列表
  const loadUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('加载用户失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 添加/更新用户
  const handleSaveUser = async () => {
    if (!formData.email || !formData.name) {
      alert('请填写邮箱和姓名')
      return
    }

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        alert(editingUser ? '更新成功' : '添加成功')
        setShowAddModal(false)
        setEditingUser(null)
        resetForm()
        loadUsers()
      } else {
        alert('操作失败')
      }
    } catch (error) {
      console.error('保存失败:', error)
      alert('操作失败')
    }
  }

  // 删除用户
  const handleDeleteUser = async (email: string) => {
    if (!confirm(`确定删除用户 ${email}？`)) return

    try {
      const res = await fetch(`/api/admin/users?email=${email}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        alert('删除成功')
        loadUsers()
      } else {
        alert('删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      alert('删除失败')
    }
  }

  // 重置表单
  const resetForm = () => {
    setFormData({
      email: '',
      name: '',
      modules: {
        ipAssistant: false,
        imageGeneration: false,
        workflow: false,
        assets: false,
      },
      credits: 0,
      expiresAt: '',
    })
  }

  // 编辑用户
  const handleEditUser = (user: UserPermissions) => {
    setEditingUser(user)
    setFormData({
      email: user.email,
      name: user.name,
      modules: { ...user.modules },
      credits: user.credits,
      expiresAt: user.expiresAt || '',
    })
    setShowAddModal(true)
  }

  // 检查是否已登录
  useEffect(() => {
    const auth = localStorage.getItem('admin_auth')
    if (auth === 'true') {
      setAuthenticated(true)
      loadUsers()
    }
  }, [])

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            管理员登录
          </h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="请输入管理员密码"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500 mb-4"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            登录
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">用户权限管理</h1>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setEditingUser(null)
                resetForm()
                setShowAddModal(true)
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              + 添加用户
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('admin_auth')
                router.push('/')
              }}
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
              退出
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">加载中...</div>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <p className="text-gray-500 mb-4">还没有用户</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-rose-600 hover:text-rose-700 font-medium"
            >
              添加第一个用户 →
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    用户信息
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    权限模块
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    积分
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    过期时间
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.email} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.modules.ipAssistant && (
                          <span className="px-2 py-1 bg-rose-100 text-rose-700 text-xs rounded">
                            IP助手
                          </span>
                        )}
                        {user.modules.imageGeneration && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                            生图
                          </span>
                        )}
                        {user.modules.workflow && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                            工作流
                          </span>
                        )}
                        {user.modules.assets && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                            资产库
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{user.credits}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.expiresAt
                        ? new Date(user.expiresAt).toLocaleDateString('zh-CN')
                        : '永久'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium mr-3"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.email)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* 添加/编辑用户模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingUser ? '编辑用户' : '添加用户'}
            </h2>

            {/* 基本信息 */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  邮箱 *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!!editingUser}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500 disabled:bg-gray-100"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  姓名 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500"
                  placeholder="张三"
                />
              </div>
            </div>

            {/* 权限模块 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                权限模块
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.modules.ipAssistant}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        modules: { ...formData.modules, ipAssistant: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-rose-600 rounded"
                  />
                  <span className="text-sm text-gray-700">IP助手</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.modules.imageGeneration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        modules: { ...formData.modules, imageGeneration: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-rose-600 rounded"
                  />
                  <span className="text-sm text-gray-700">图像生成</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.modules.workflow}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        modules: { ...formData.modules, workflow: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-rose-600 rounded"
                  />
                  <span className="text-sm text-gray-700">工作流</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.modules.assets}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        modules: { ...formData.modules, assets: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-rose-600 rounded"
                  />
                  <span className="text-sm text-gray-700">资产库</span>
                </label>
              </div>
            </div>

            {/* 积分和过期时间 */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  积分
                </label>
                <input
                  type="number"
                  value={formData.credits}
                  onChange={(e) =>
                    setFormData({ ...formData, credits: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  过期时间（可选）
                </label>
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* 按钮 */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingUser(null)
                  resetForm()
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveUser}
                className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors"
              >
                {editingUser ? '保存修改' : '添加用户'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
