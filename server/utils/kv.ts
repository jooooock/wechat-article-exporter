export const useKv = async () => {
    if ((globalThis as any).Deno) {
        return (globalThis as any).Deno.openKv()
    }
    if (process.dev) {
        const OpenKV = () => import('@deno/kv')
        const { openKv } = await OpenKV()
        return openKv('')
    }
    throw createError({
        statusCode: 500,
        message: 'Could not find a Deno KV for production, make sure to deploy on Deno Deploy.'
    })
}

export interface User {
    uuid: string
    fakeid: string
    originalID: string
    nickname: string
    avatar: string
    createdAt: number
}

/**
 * 创建新用户
 * @param user
 */
export async function createUser(user: User): Promise<boolean> {
    const key = ["users", user.originalID]

    const kv = await useKv()
    const res = await kv.atomic()
        .check({key, versionstamp: null})
        .set(key, user)
        .commit()
    return !!res.ok
}
