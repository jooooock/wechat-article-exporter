export default () => {
    return useLocalStorage<string>('token', null)
}
