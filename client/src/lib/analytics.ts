// Analytics tracking utilities
export interface TrackingData {
  url: string;
  title: string;
  referrer?: string;
  sessionId: string;
  deviceType: string;
  browser: string;
  os: string;
  country?: string;
  city?: string;
}

export class AnalyticsTracker {
  private sessionId: string;
  private startTime: number;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.startTime = Date.now();
    this.trackPageView();
    this.setupPageLeaveTracking();
  }

  private getOrCreateSessionId(): string {
    let sessionId = localStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  private getDeviceType(): string {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }

  private getBrowser(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    if (ua.includes('Opera')) return 'Opera';
    return 'Unknown';
  }

  private getOS(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  private async getLocation(): Promise<{ country?: string; city?: string }> {
    try {
      // Using a free IP geolocation service
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return {
        country: data.country_name,
        city: data.city
      };
    } catch (error) {
      console.warn('Failed to get location data:', error);
      return {};
    }
  }

  async trackPageView(): Promise<void> {
    try {
      const location = await this.getLocation();
      const trackingData: TrackingData = {
        url: window.location.href,
        title: document.title,
        referrer: document.referrer,
        sessionId: this.sessionId,
        deviceType: this.getDeviceType(),
        browser: this.getBrowser(),
        os: this.getOS(),
        ...location
      };

      // Get client IP (this will be handled server-side)
      const response = await fetch('/api/analytics/track-visit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trackingData),
      });

      if (!response.ok) {
        console.warn('Failed to track page view');
      }
    } catch (error) {
      console.warn('Analytics tracking error:', error);
    }
  }

  private setupPageLeaveTracking(): void {
    const trackSessionEnd = () => {
      const duration = Math.floor((Date.now() - this.startTime) / 1000);
      const pageViews = 1; // Simplified - in a real implementation, you'd track multiple page views per session

      fetch('/api/analytics/update-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          duration,
          pageViews
        }),
      }).catch(error => {
        console.warn('Failed to update session:', error);
      });
    };

    // Track when user leaves the page
    window.addEventListener('beforeunload', trackSessionEnd);

    // Track when user becomes inactive (after 30 minutes)
    let inactivityTimer: number;
    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = window.setTimeout(trackSessionEnd, 30 * 60 * 1000); // 30 minutes
    };

    // Reset timer on user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, resetInactivityTimer, true);
    });

    resetInactivityTimer();
  }
}

// Initialize analytics tracking
export const initAnalytics = (): void => {
  if (typeof window !== 'undefined') {
    // Only initialize if not already done
    if (!(window as any).analyticsTracker) {
      (window as any).analyticsTracker = new AnalyticsTracker();
    }
  }
};

// Track custom events (for future use)
export const trackEvent = (eventName: string, data?: any): void => {
  // Future implementation for custom event tracking
  console.log('Event tracked:', eventName, data);
};