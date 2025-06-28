export const GA_TRACKING_ID = 'G-XXXXXXXXXX'

// Log page views
export const pageview = (url: string) => {
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  })
}
