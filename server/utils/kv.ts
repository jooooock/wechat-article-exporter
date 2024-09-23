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
    const primaryKey = ["users", user.originalID]
    const byFakeIDKey = ["users_by_fakeid", user.fakeid]
    const byUuidKey = ["users_by_uuid", user.uuid]

    const kv = await useKv()
    const res = await kv.atomic()
        .check({key: primaryKey, versionstamp: null})
        .set(primaryKey, user)
        .set(byFakeIDKey, user.originalID)
        .set(byUuidKey, user.originalID)
        .commit()
    return !!res.ok
}
