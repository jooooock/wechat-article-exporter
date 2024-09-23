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

export interface UserEntry {
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
export async function createUser(user: UserEntry): Promise<boolean> {
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

export async function getUserByUUID(uuid: string): Promise<UserEntry | null> {
    const kv = await useKv()
    const res = await kv.get(["users_by_uuid", uuid])
    return res.value
}

export interface UsageEntry {
    uuid: string
    usageCount: number
    successCount: number
    failureCount: number
    traffic: number
    date: number
}

export async function updateUsage(usage: UsageEntry): Promise<void> {
    const kv = await useKv();
    const res = await kv.atomic()
        .set(["usage", usage.uuid, usage.date], usage)
        .commit();
    if (!res.ok) {
        console.warn('统计数据写入失败')
    }
    kv.close();
}

export async function logUsage(uuid: string, cookie: string, usage: any) {
    const kv = await useKv();
    kv.set([uuid, Date.now(), cookie], usage)
    kv.close()
}
