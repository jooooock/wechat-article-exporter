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
