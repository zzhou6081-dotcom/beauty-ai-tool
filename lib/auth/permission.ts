import { NextRequest, NextResponse } from 'next/server'
import { checkWhitelist } from '@/lib/auth/whitelist'

/**
 * 权限中间件
 * 检查用户是否在白名单中，以及是否有相应模块的权限
 */
export async function checkPermission(
  request: NextRequest,
  module: 'ipAssistant' | 'imageGeneration' | 'workflow' | 'assets'
): Promise<{ allowed: boolean; user?: any; error?: string }> {
  // 从 session/cookie 获取用户邮箱
  // 这里需要根据你的认证系统调整
  const userEmail = request.cookies.get('user_email')?.value

  if (!userEmail) {
    return { allowed: false, error: '请先登录' }
  }

  // 检查白名单
  const user = await checkWhitelist(userEmail)

  if (!user) {
    return { allowed: false, error: '您暂无使用权限，请联系管理员开通' }
  }

  // 检查模块权限
  if (!user.modules[module]) {
    return { allowed: false, error: `您暂无 ${getModuleName(module)} 权限，请联系管理员开通` }
  }

  return { allowed: true, user }
}

function getModuleName(module: string): string {
  const names: Record<string, string> = {
    ipAssistant: 'IP助手',
    imageGeneration: '图像生成',
    workflow: '工作流',
    assets: '资产库',
  }
  return names[module] || module
}
