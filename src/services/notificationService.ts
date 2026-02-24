
export class NotificationService {
    static async requestPermission() {
        if (!('Notification' in window)) {
            console.warn('Este navegador não suporta notificações.');
            return false;
        }

        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    static async scheduleNotification(title: string, body: string, delayMs: number) {
        if (Notification.permission !== 'granted') return;

        // Para uma implementação real de PWA offline, usaríamos o Service Worker.
        // Aqui fazemos uma simulação local/runtime.
        setTimeout(() => {
            new Notification(title, {
                body,
                icon: '/favicon.svg'
            });
        }, delayMs);
    }

    static async sendInstant(title: string, body: string) {
        if (Notification.permission !== 'granted') {
            const granted = await this.requestPermission();
            if (!granted) return;
        }

        new Notification(title, {
            body,
            icon: '/favicon.svg'
        });
    }
}
