// Single source for every product, plan and price on the site.
// Prices are copied from each product's own source; update them here only.
//   BizPOS     -> AppMeraung/bizpos docs/subscription-plans.md
//   MyKiosk2U  -> AppMeraung/mykiosk2u src/lib/plans.ts
//   MOTO       -> App-Meraung-Studio frontend/src/catalog.js
//   Skola      -> App-Meraung-Studio frontend/src/pages/Skola.jsx
//   AffilixHQ  -> AppMeraung/affilixhq apps/web/src/data/platform.ts
//   Landing    -> App-Meraung-Studio frontend/src/pages/LandingPage.jsx
//   Website, custom system, restaurant POS, add-ons -> App-Meraung-Studio frontend/src/studioData.js

export const categories = [
  { id: "fnb", name: "Restaurants & F&B", line: "Take orders, run the kitchen and get paid." },
  { id: "team", name: "Business & sales teams", line: "Meetings, agents and commissions, handled." },
  { id: "edu", name: "Teaching & training", line: "Run your classes online." },
  { id: "online", name: "Get your business online", line: "A page, a website or your own system — built for you." },
];

export const products = [
  {
    id: "bizpos", need: "Run a restaurant, café or shop", cat: "fnb", type: "ready", name: "BizPOS", img: "bizpos",
    what: "POS and daily operations for restaurants and SMEs.",
    bestFor: "Cafés, restaurants and small shops that want one system for counter, kitchen and stock.",
    trial: "7-day free trial, no card", platforms: "Web · Android",
    features: ["POS, orders, table plan and customers", "Inventory, recipes, suppliers and purchase orders", "QR menu at the table and kitchen display", "Self-service kiosk, loyalty, promotions and vouchers"],
    yearlyNote: "save 10%",
    plans: [
      { id: "basic", name: "Basic", monthly: 99, yearly: 1069, limits: "1 outlet · 3 staff · 500 products", includes: "POS, orders, tables, products, customers, sales summary" },
      { id: "pro", name: "Pro", monthly: 199, yearly: 2149, popular: true, limits: "2 outlets · 10 staff · unlimited products", includes: "Everything in Basic + inventory, recipes, suppliers, PO, QR menu, KDS, audit log" },
      { id: "premium", name: "Premium", monthly: 349, yearly: 3769, limits: "5 outlets · unlimited staff", includes: "Everything in Pro + self-service kiosk, CRM and loyalty, promotions, vouchers, priority support" },
      { id: "chain", name: "Chain", contact: true, limits: "Unlimited outlets", includes: "Everything in Premium + onboarding and staff training" },
    ],
    cta: { label: "Start free trial", url: "https://bizpos.my" },
    payNote: "You sign up on bizpos.my. Pay online by card, FPX or e-wallet through CHIP, or through Google Play in the Android app.",
  },
  {
    id: "mykiosk", need: "Let customers order at a kiosk", cat: "fnb", type: "ready", name: "MyKiosk2U", img: "mykiosk",
    what: "A self-order kiosk: customers order and pay, the kitchen sees it on screen.",
    bestFor: "Busy F&B counters that want shorter queues and fewer wrong orders.",
    trial: "3-day free trial", platforms: "Web · Android · Kiosk",
    features: ["Self-service kiosk terminal", "Kitchen display and pickup screen", "Queue numbers and digital receipts", "Staff, shifts, PIN and profit reports"],
    yearlyNote: "2 months free",
    plans: [
      { id: "basic", name: "Basic", monthly: 99, yearly: 990, limits: "1 kiosk terminal", includes: "Kitchen display, pickup screen, queue numbers, daily sales report, DuitNow QR and Touch 'n Go" },
      { id: "pro", name: "Pro", monthly: 169, yearly: 1690, popular: true, limits: "Staff and shifts", includes: "Everything in Basic + staff, shifts and PIN, daily to yearly reports, cost and margin, printing, WhatsApp support" },
      { id: "signature", name: "Signature", monthly: 269, yearly: 2690, limits: "Full payments", includes: "Everything in Pro + card, FPX and e-wallets, unlimited toppings, auto closing export, 4-hour support SLA" },
      { id: "complete", name: "Complete Kiosk", once: 12999, limits: "Software + device", includes: "Signature licence, 15.6\" or 21.5\" touch kiosk, metal stand, 80mm printer, on-site install and training, 12-month warranty" },
    ],
    cta: { label: "Start free trial", url: "https://mykiosk.meraung.com/pakej" },
    payNote: "You choose and pay on MyKiosk2U through CHIP, or Google Play in the Android app. Complete Kiosk delivery and install are scheduled with you.",
  },
  {
    id: "resto-pos", need: "Own a POS built for my restaurant", cat: "fnb", type: "build", name: "Restaurant POS", img: "resto",
    what: "Your own restaurant POS, built for your outlet and paid once.",
    bestFor: "Owners who prefer to own the system instead of a monthly plan.",
    platforms: "Built for you",
    features: ["Menu with variants, add-ons, SST and service charge", "Tables, QR ordering and kitchen display (Pro)", "Recipes, food cost, loyalty and online store (Premium)", "Yearly maintenance plan after launch"],
    plans: [
      { id: "basic", name: "Basic", once: 8000, extra: "+ RM1,200/yr maintenance", delivery: "~2–3 weeks", includes: "Stalls, food trucks, small cafés · 1 outlet, 1 device · offline mode" },
      { id: "pro", name: "Pro", once: 15000, extra: "+ RM2,400/yr maintenance", delivery: "~4–6 weeks", popular: true, includes: "Dine-in restaurants · 3 devices · table plan, QR ordering, kitchen display, split bill" },
      { id: "premium", name: "Premium", once: 25000, extra: "+ RM3,600/yr maintenance", delivery: "~8–10 weeks", includes: "Large restaurants and chains · up to 3 outlets · central dashboard, recipes, e-Invoice LHDN, GrabFood/Foodpanda" },
    ],
  },
  {
    id: "moto", need: "Stop writing meeting minutes", cat: "team", type: "ready", name: "MOTO", img: "moto",
    what: "Meeting On The Go: record a meeting, get the transcript and AI minutes.",
    bestFor: "Managers, sales teams and consultants who sit in many meetings.",
    platforms: "Web · Android",
    features: ["AI transcription with speaker names", "Summary, minutes table and action items", "Mind map and illustrated notes (Pro)", "Export to PDF, DOCX and Excel"],
    plans: [
      { id: "basic", name: "Basic", monthly: 19.9, limits: "10 meetings / month · 60 min", includes: "Summary, minutes and action items, PDF and DOCX export" },
      { id: "pro", name: "Pro", monthly: 39.9, popular: true, limits: "30 meetings / month · 2 hours", includes: "Everything in Basic + mind map, speaker detection, Excel export" },
      { id: "premium", name: "Premium", monthly: 79.9, limits: "Unlimited meetings · 2 hours", includes: "Everything in Pro + priority AI processing" },
    ],
    cta: { label: "Open MOTO", url: "https://meraung.com/moto/app" },
    payNote: "Billed monthly through CHIP. Need more time? Top up at RM5 per hour.",
  },
  {
    id: "affilixhq", need: "Sell through agents and affiliates", cat: "team", type: "ready", name: "AffilixHQ", img: "affilixhq",
    what: "An affiliate platform: campaigns, agents, tracking links and commission payouts.",
    bestFor: "Brands that sell through agents, resellers or affiliates.",
    trial: "7-day free trial, no card", platforms: "Web · Android",
    features: ["Campaigns, agents and tracking links", "Sales and commission tracking", "Commission payouts through CHIP", "Bonuses, leads and fraud checks (Pro)"],
    plans: [
      { id: "payg", name: "Pay per transaction", monthly: 0, extra: "+ 2% per commission paid", limits: "1 campaign · 20 agents", includes: "Start with no monthly fee" },
      { id: "basic", name: "Basic", monthly: 59, limits: "3 campaigns · 50 agents", includes: "No transaction fee, 1 brand" },
      { id: "pro", name: "Pro", monthly: 149, popular: true, limits: "10 campaigns · 300 agents", includes: "3 brands, bonuses, leads, fraud checks, full reports and CSV, priority support" },
      { id: "premium", name: "Premium", monthly: 349, limits: "Unlimited", includes: "Unlimited campaigns, agents and brands, API and webhooks, priority WhatsApp support" },
    ],
    cta: { label: "Start free trial", url: "https://affilixhq.com" },
    payNote: "You sign up on affilixhq.com and pay through CHIP.",
  },
  {
    id: "skola", need: "Teach classes online", cat: "edu", type: "ready", name: "Skola", img: "skola",
    what: "Online classes, quizzes, exams and certificates in one place.",
    bestFor: "Tutors, tuition centres and training providers.",
    trial: "7-day free trial", platforms: "Web",
    features: ["Classes and material uploads", "Google Meet and Zoom", "Quizzes, assignments and exams", "Certificates and progress reports"],
    yearlyNote: "2 months free",
    plans: [
      { id: "basic", name: "Basic", monthly: 29, yearly: 290, limits: "3 classes", includes: "Limited uploads, Google Meet, basic certificate, email support" },
      { id: "pro", name: "Pro", monthly: 79, yearly: 790, popular: true, limits: "Unlimited classes", includes: "Unlimited uploads, Zoom + Meet, quizzes and assignments, detailed reports" },
      { id: "premium", name: "Premium", monthly: 149, yearly: 1490, limits: "Full exam system", includes: "Everything in Pro + own branding and domain, own API keys, referrals, 24-hour support" },
    ],
    cta: { label: "Start free trial", url: "https://meraung.com/skola/app" },
    payNote: "Billed through CHIP. Help setting up your own API keys: RM249 one-time.",
  },
  {
    id: "landing", need: "Get online fast with one page", cat: "online", type: "build", name: "Landing page", img: "lume", imgNote: "Example: LUMÉ, built by Meraung",
    what: "One professional page that turns visitors into enquiries.",
    bestFor: "A new business, a product launch or an ad campaign.",
    platforms: "Built for you",
    features: ["Mobile-friendly design", "Enquiry form and contact button", "Gallery, testimonials and Google Maps (Pro)", "Bilingual BM + EN (Premium)"],
    plans: [
      { id: "basic", name: "Basic", once: 790, delivery: "5–7 working days", includes: "Up to 4 sections, basic SEO, 1 revision, 7 days support" },
      { id: "pro", name: "Pro", once: 1500, delivery: "7–10 working days", popular: true, includes: "Up to 8 sections, gallery, maps, analytics, 2 revisions, 14 days support" },
      { id: "premium", name: "Premium", once: 2900, delivery: "5–7 days, priority", includes: "Up to 12 sections, bilingual, advanced SEO, lead capture, 3 revisions, 30 days support" },
    ],
  },
  {
    id: "website", need: "Have a full company website", cat: "online", type: "build", name: "Website", img: "studio", imgNote: "Example: Meraung Studio website",
    what: "A full company or booking website that shows up on Google.",
    bestFor: "Businesses that need several pages, a blog or bookings.",
    platforms: "Built for you",
    features: ["1–5 pages (Basic) or up to 10 with CMS (Pro)", "Blog or gallery, booking or enquiry form", "SEO, Search Console and analytics", "Domain and Google Business set up"],
    plans: [
      { id: "basic", name: "Basic", from: 2000, delivery: "~1–2 weeks", includes: "1–5 pages, contact form, basic SEO, Google setup, 1 revision" },
      { id: "pro", name: "Pro", from: 4500, delivery: "~2–4 weeks", popular: true, includes: "Up to 10 pages + CMS, blog or gallery, SEO + analytics, booking form, 2 revisions" },
    ],
  },
  {
    id: "custom", need: "Build my own system or app", cat: "online", type: "build", name: "Custom system & app", img: "tujuan", imgNote: "Example: Tujuan, built by Meraung",
    what: "Your own web system or mobile app, built around how you work.",
    bestFor: "Portals, dashboards, booking or membership systems, iOS and Android apps.",
    platforms: "Built for you",
    features: ["Accounts, roles and permissions", "Payment gateway and admin dashboard", "Membership, wallet and reports", "iOS and Android app as an add-on"],
    plans: [
      { id: "system", name: "Custom system", from: 12000, delivery: "~4–8 weeks", popular: true, includes: "Web system, database, accounts and roles, payment gateway, admin dashboard" },
      { id: "multi", name: "Multi-company", from: 20000, delivery: "Custom timeline", includes: "Many companies in one system, isolated data, HQ portal, priority support" },
      { id: "mobile", name: "Mobile app add-on", from: 6000, delivery: "3–6 weeks", includes: "iOS and Android app with store submission" },
    ],
  },
];

export const addons = [
  ["Domain .com", "From RM70/year"], ["Domain .my", "From RM120/year"], ["Hosting", "From RM250/year"],
  ["Extra landing page section", "From RM180"], ["Extra website page", "RM300–500 per page"], ["Full copywriting", "From RM350"],
  ["Simple logo", "From RM280"], ["Payment gateway setup", "RM800–1,500"], ["SEO + Google indexing", "RM800–1,500"],
  ["Landing page maintenance", "From RM120/month"], ["Website / system maintenance", "RM300–800/month"],
];

// "RM1,069", "RM19.90"
export const rm = (n) => "RM" + (Number.isInteger(n) ? n.toLocaleString("en-MY") : n.toFixed(2));

// Lowest price shown on cards, e.g. "From RM99 / month".
export function fromPrice(p) {
  const first = p.plans.find((x) => !x.contact);
  if (first.monthly === 0) return "Free to start + 2% per payout";
  if (first.monthly !== undefined) return `From ${rm(first.monthly)} / month`;
  if (first.once !== undefined) return `From ${rm(first.once)} one-time`;
  return `From ${rm(first.from)}`;
}
