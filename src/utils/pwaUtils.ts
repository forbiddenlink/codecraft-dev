/**
 * PWA Utilities - Service Worker registration and PWA features
 */

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

class PWAManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isInstalled = false;
  private registration: ServiceWorkerRegistration | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.initialize();
    }
  }

  private initialize(): void {
    // Check if already installed
    this.isInstalled = window.matchMedia("(display-mode: standalone)").matches;

    // Listen for install prompt
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      console.log("Install prompt available");
    });

    // Listen for app installed
    window.addEventListener("appinstalled", () => {
      this.isInstalled = true;
      this.deferredPrompt = null;
      console.log("PWA installed");
    });
  }

  /**
   * Register service worker
   */
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      console.warn("Service workers not supported");
      return null;
    }

    try {
      this.registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });

      console.log("Service Worker registered:", this.registration);

      // Check for updates
      this.registration.addEventListener("updatefound", () => {
        const newWorker = this.registration!.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              console.log("New service worker available");
              // Notify user about update
              this.notifyUpdate();
            }
          });
        }
      });

      return this.registration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      return null;
    }
  }

  /**
   * Notify user about available update
   */
  private notifyUpdate(): void {
    // You can show a toast/modal here
    if (confirm("New version available! Reload to update?")) {
      this.updateServiceWorker();
    }
  }

  /**
   * Update service worker
   */
  updateServiceWorker(): void {
    if (!this.registration) return;

    this.registration.waiting?.postMessage({ type: "SKIP_WAITING" });
    window.location.reload();
  }

  /**
   * Show install prompt
   */
  async showInstallPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.warn("Install prompt not available");
      return false;
    }

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("User accepted install");
      this.deferredPrompt = null;
      return true;
    } else {
      console.log("User dismissed install");
      return false;
    }
  }

  /**
   * Check if install prompt is available
   */
  canInstall(): boolean {
    return this.deferredPrompt !== null && !this.isInstalled;
  }

  /**
   * Check if app is installed
   */
  isAppInstalled(): boolean {
    return this.isInstalled;
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      console.warn("Notifications not supported");
      return "denied";
    }

    const permission = await Notification.requestPermission();
    console.log("Notification permission:", permission);
    return permission;
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.registration) {
      console.warn("Service worker not registered");
      return null;
    }

    try {
      // You'll need to replace this with your VAPID public key
      const vapidPublicKey = "YOUR_VAPID_PUBLIC_KEY";

      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey),
      });

      console.log("Push subscription:", subscription);
      return subscription;
    } catch (error) {
      console.error("Failed to subscribe to push:", error);
      return null;
    }
  }

  /**
   * Convert VAPID key
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(new ArrayBuffer(rawData.length));

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Show local notification
   */
  async showNotification(
    title: string,
    options?: NotificationOptions,
  ): Promise<void> {
    if (!this.registration) return;

    await this.registration.showNotification(title, {
      icon: "/icon-192x192.png",
      badge: "/badge-72x72.png",
      ...options,
    });
  }

  /**
   * Background sync
   */
  async syncData(tag: string): Promise<void> {
    if (!this.registration || !("sync" in this.registration)) {
      console.warn("Background sync not supported");
      return;
    }

    try {
      await (this.registration as any).sync.register(tag);
      console.log("Background sync registered:", tag);
    } catch (error) {
      console.error("Background sync failed:", error);
    }
  }

  /**
   * Share content (Web Share API)
   */
  async share(data: ShareData): Promise<boolean> {
    if (!navigator.share) {
      console.warn("Web Share API not supported");
      return false;
    }

    try {
      await navigator.share(data);
      return true;
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Share failed:", error);
      }
      return false;
    }
  }

  /**
   * Check network status
   */
  isOnline(): boolean {
    return typeof window !== "undefined" ? navigator.onLine : true;
  }

  /**
   * Listen for online/offline events
   */
  onConnectionChange(callback: (isOnline: boolean) => void): () => void {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }
}

// Singleton instance
let pwaInstance: PWAManager | null = null;

export function getPWAManager(): PWAManager {
  if (!pwaInstance) {
    pwaInstance = new PWAManager();
  }
  return pwaInstance;
}

// Convenience exports
export const registerServiceWorker = () =>
  getPWAManager().registerServiceWorker();
export const showInstallPrompt = () => getPWAManager().showInstallPrompt();
export const canInstall = () => getPWAManager().canInstall();
export const isAppInstalled = () => getPWAManager().isAppInstalled();
export const requestNotifications = () =>
  getPWAManager().requestNotificationPermission();
export const shareContent = (data: ShareData) => getPWAManager().share(data);
export const isOnline = () => getPWAManager().isOnline();
