// Optional: Additional browser history protection
// This can be added to your app component if you want extra protection

export class BrowserHistoryGuard {

    // Prevent back button when user is on login after logout
    static preventLoginBackNavigation(): void {
        // Push a dummy state to prevent back navigation to authenticated pages
        history.pushState(null, '', location.href);

        window.addEventListener('popstate', () => {
            // Force forward navigation if user tries to go back
            history.pushState(null, '', location.href);
        });
    }

    // Clear browser history (nuclear option)
    static clearBrowserHistory(): void {
        // This replaces the current history entry
        history.replaceState(null, '', '/login');
    }

    // Disable browser cache for authenticated pages
    static disableBrowserCache(): void {
        // Add meta tags to prevent caching
        const metaNoCache = document.createElement('meta');
        metaNoCache.httpEquiv = 'Cache-Control';
        metaNoCache.content = 'no-cache, no-store, must-revalidate';
        document.head.appendChild(metaNoCache);

        const metaPragma = document.createElement('meta');
        metaPragma.httpEquiv = 'Pragma';
        metaPragma.content = 'no-cache';
        document.head.appendChild(metaPragma);

        const metaExpires = document.createElement('meta');
        metaExpires.httpEquiv = 'Expires';
        metaExpires.content = '0';
        document.head.appendChild(metaExpires);
    }
}
