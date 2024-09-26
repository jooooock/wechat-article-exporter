import {useKv} from "~/server/utils/kv";


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

    // 注意: fakeid 可能是空
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

export async function getUserByUUID(uuid: string = "__unknown__"): Promise<UserEntry | null> {
    const kv = await useKv()
    const {value: originalID} = await kv.get(["users_by_uuid", uuid])
    if (originalID) {
        const {value: user} = await kv.get(["users", originalID])
        return user
    }
    return null
}

/**
 * 由于 fakeid 可能为空，所以此方法被废弃，不推荐使用
 * @param fakeid
 * @deprecated
 */
export async function getUserByFakeID(fakeid: string): Promise<UserEntry | null> {
    const kv = await useKv()
    const {value: originalID} = await kv.get(["users_by_fakeid", fakeid])
    if (originalID) {
        const {value: user} = await kv.get(["users", originalID])
        return user
    }
    return null
}

export async function getUser(originalID: string): Promise<UserEntry | null> {
    const kv = await useKv()
    const {value: user} = await kv.get(["users", originalID])
    return user
}
