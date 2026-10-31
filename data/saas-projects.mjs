// Eligible SaaS projects follow the order returned by the connected GitHub
// installation on 30 October 2026, after non-SaaS repositories are filtered out.
// Metrics remain server-side and use the adapter named by metricsKey.
export const saasProjects = [
  {
    id: "moto", name: "MOTO", category: "Productivity",
    description: "Meeting transcription, minutes and action items.", vendorNoun: "organisations", metricsKey: "MOTO",
    links: [{ label: "Open app", url: "https://meraung.com/moto/app" }, { label: "Source repo", url: "https://github.com/AppMeraung/App-Meeting-On-The-Go" }],
  },
  {
    id: "barber-pro", name: "Barber PRO", category: "Bookings",
    description: "Barbershop booking and vendor operations.", vendorNoun: "barbershops", metricsKey: "BARBER_PRO",
    links: [{ label: "Source repo", url: "https://github.com/AppMeraung/barber-booking" }, { label: "Public support repo", url: "https://github.com/AppMeraung/barber-pro-support" }],
  },
  {
    id: "bizpos", name: "BizPOS", category: "F&B / Retail",
    description: "POS and daily operations for restaurants and SMEs.", vendorNoun: "businesses", metricsKey: "BIZPOS",
    links: [{ label: "Open app", url: "https://bizpos.my" }, { label: "Source repo", url: "https://github.com/AppMeraung/bizpos" }],
  },
  {
    id: "mykiosk", name: "MyKiosk2U", category: "F&B",
    description: "Self-order kiosk, kitchen display and pickup flow.", vendorNoun: "outlets", metricsKey: "MYKIOSK",
    links: [{ label: "Open app", url: "https://mykiosk.meraung.com/pakej" }, { label: "Source repo", url: "https://github.com/AppMeraung/mykiosk2u" }],
  },
  {
    id: "skola", name: "Skola", category: "Education",
    description: "Classes, quizzes, exams and certificates.", vendorNoun: "education providers", metricsKey: "SKOLA",
    links: [{ label: "Open app", url: "https://meraung.com/skola/app" }, { label: "Source repo", url: "https://github.com/AppMeraung/App-Meraung-Studio" }],
  },
  {
    id: "kendurikita", name: "KenduriKita", category: "Events",
    description: "Malaysia-focused wedding and kenduri planning.", vendorNoun: "vendors", metricsKey: "KENDURIKITA",
    links: [{ label: "Public repo", url: "https://github.com/AppMeraung/kendurikita" }],
  },
  {
    id: "eventsnap2u", name: "EventSnap2U", category: "Events",
    description: "Shared event camera and gallery for hosts and their guests.", vendorNoun: "event hosts", metricsKey: "EVENTSNAP2U",
    links: [{ label: "Open app", url: "https://eventsnap2u.com" }, { label: "Source repo", url: "https://github.com/AppMeraung/eventsnap2u" }],
  },
  {
    id: "fonkita", name: "FonKita", category: "Retail",
    description: "Phone-store sales, products, orders and bookings.", vendorNoun: "stores", metricsKey: "FONKITA",
    links: [{ label: "Open app", url: "https://fonkita.com" }, { label: "Source repo", url: "https://github.com/AppMeraung/fonkita" }],
  },
  {
    id: "affilixhq", name: "AffilixHQ", category: "Affiliate sales",
    description: "Campaigns, agents, tracking and commission payouts.", vendorNoun: "brands", metricsKey: "AFFILIXHQ",
    links: [{ label: "Open app", url: "https://affilixhq.com" }, { label: "Source repo", url: "https://github.com/AppMeraung/affilixhq" }],
  },
];
