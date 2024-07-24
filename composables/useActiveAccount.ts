import type {AccountInfo} from "~/types/types";
import {StorageSerializers} from "@vueuse/core";


export default () => {
    return useLocalStorage<AccountInfo | null>('account', null, {
        serializer: StorageSerializers.object
    })
}
