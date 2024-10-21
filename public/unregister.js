async function unregisterServiceWorker() {
    if ("serviceWorker" in navigator) {
        try {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                for (const registration of registrations) {
                    registration.unregister();
                }
            });
        } catch (error) {
            console.error(`UnRegistration failed with ${error}`)
        }
    }
}

unregisterServiceWorker()
