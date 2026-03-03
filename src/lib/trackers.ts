interface ConsentState {
  analytics: boolean;
  marketing: boolean;
  ads: boolean;
}

export const loadTrackers = (consent: ConsentState) => {
  if (typeof window === "undefined") return;

  removeTrackers();

  if (consent.analytics && process.env.NEXT_PUBLIC_GA_ID) {
    loadGoogleAnalytics(process.env.NEXT_PUBLIC_GA_ID);
  }

  if (consent.marketing && process.env.NEXT_PUBLIC_META_PIXEL_ID) {
    loadMetaPixel(process.env.NEXT_PUBLIC_META_PIXEL_ID);
  }

  if (consent.ads && process.env.NEXT_PUBLIC_GOOGLE_ADS_ID) {
    loadGoogleAds(process.env.NEXT_PUBLIC_GOOGLE_ADS_ID);
  }
};

const removeTrackers = () => {
  const scripts = document.querySelectorAll("script[data-tracker]");
  scripts.forEach((script) => script.remove());
};

const loadGoogleAnalytics = (gaId: string) => {

  const script1 = document.createElement("script");
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  script1.async = true;
  script1.setAttribute("data-tracker", "analytics");
  document.head.appendChild(script1);

  
  const script2 = document.createElement("script");
  script2.setAttribute("data-tracker", "analytics");
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${gaId}');
  `;
  document.head.appendChild(script2);
};

const loadMetaPixel = (pixelId: string) => {
  const script = document.createElement("script");
  script.setAttribute("data-tracker", "marketing");
  script.innerHTML = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${pixelId}');
    fbq('track', 'PageView');
  `;
  document.head.appendChild(script);
};

const loadGoogleAds = (adsId: string) => {
  const script = document.createElement("script");
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsId}`;
  script.async = true;
  script.crossOrigin = "anonymous";
  script.setAttribute("data-tracker", "ads");
  document.head.appendChild(script);
};
