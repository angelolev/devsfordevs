// Google Analytics utility functions

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

// Replace this with your actual GA Measurement ID
export const GA_MEASUREMENT_ID =
  import.meta.env.VITE_GA_MEASUREMENT_ID || "GA_MEASUREMENT_ID";

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", GA_MEASUREMENT_ID, {
      page_title: document.title,
      page_location: window.location.href,
    });
  }
};

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", GA_MEASUREMENT_ID, {
      page_path: url,
      page_title: title || document.title,
      page_location: window.location.href,
    });
  }
};

// Track custom events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track user properties
export const setUserProperties = (properties: Record<string, unknown>) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", GA_MEASUREMENT_ID, {
      user_properties: properties,
    });
  }
};

// Track conversions
export const trackConversion = (
  conversionId: string,
  conversionLabel?: string
) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "conversion", {
      send_to: `${conversionId}/${conversionLabel}`,
    });
  }
};

// Common event tracking functions
export const trackButtonClick = (buttonName: string, location?: string) => {
  trackEvent(
    "click",
    "button",
    `${buttonName}${location ? ` - ${location}` : ""}`,
    1
  );
};

export const trackFormSubmit = (formName: string) => {
  trackEvent("submit", "form", formName, 1);
};

export const trackDownload = (fileName: string) => {
  trackEvent("download", "file", fileName, 1);
};

export const trackOutboundLink = (url: string) => {
  trackEvent("click", "outbound_link", url, 1);
};

export const trackSearch = (searchTerm: string, resultCount?: number) => {
  trackEvent("search", "site_search", searchTerm, resultCount);
};

export const trackSocialShare = (platform: string, content?: string) => {
  trackEvent(
    "share",
    "social",
    `${platform}${content ? ` - ${content}` : ""}`,
    1
  );
};
