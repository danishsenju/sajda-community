# KARIAH — Mosque Community Platform
## Claude Code Project Brief

---

## PROJECT OVERVIEW

**App Name:** Kariah  
**Tagline:** "Bukan sekadar info. Ini rumah komuniti kau."  
**Target Mosque:** Masjid Saujana Utama, Bandar Saujana Utama, 47000 Sungai Buloh, Selangor  
**Type:** Progressive Web App (PWA)  
**Stack:** Next.js 14 (App Router) + Supabase + Vercel  
**Auth:** Google OAuth + Email/Password + Guest (read-only)  
**Timeline:** Build in ~1.5 days (hackathon RC26 by KrackedDevs)

---

## TECH STACK

```
Framework:     Next.js 14 (App Router, TypeScript)
Database:      Supabase (PostgreSQL + RLS)
Auth:          Supabase Auth (Google OAuth + Email/Password)
Styling:       Tailwind CSS
Fonts:         Syne (display/headings) + DM Sans (body) — load via next/font from Google Fonts
Icons:         Lucide React
Deploy:        Vercel
PWA:           next-pwa
```

---

## DESIGN SYSTEM — SENIOR UI/UX SPEC

### Philosophy
**"Sacred Futurism"** — The intersection of Islamic geometric tradition and near-future digital interfaces. Think: a mosque designed by architects who grew up on Dune and studied Islamic art. Dark, precise, alive with subtle motion. NOT your typical green-and-gold mosque app.

### Color Palette (CSS Variables)
```css
--bg-base: #080C0A           /* Near-black with green undertone */
--bg-surface: #0F1712        /* Cards, panels */
--bg-elevated: #162019       /* Hover states, modals */
--border: #1E2D22            /* Subtle borders */
--border-accent: #2A4030     /* Highlighted borders */

--primary: #4ADE80           /* Bright sacred green — main CTA */
--primary-dim: #22C55E       /* Slightly dimmer green */
--primary-glow: rgba(74,222,128,0.15) /* Glow effect */

--accent-gold: #F59E0B       /* Urgent/pinned items */
--accent-red: #EF4444        /* Danger/cancel */

--text-primary: #F0FDF4      /* Near-white with green tint */
--text-secondary: #86EFAC    /* Muted green-white */
--text-dim: #4ADE8066        /* Very dim for placeholders */

--gradient-mesh: radial-gradient(ellipse at 20% 50%, rgba(74,222,128,0.08) 0%, transparent 60%),
                 radial-gradient(ellipse at 80% 20%, rgba(74,222,128,0.05) 0%, transparent 50%)
```

### Typography
```
Display font:  'Syne' — weights 700, 800 (headings, hero text, nav brand)
Body font:     'DM Sans' — weights 400, 500 (body text, UI elements)

Usage:
- Page titles:     Syne 800, text-3xl to text-5xl
- Section headers: Syne 700, text-xl to text-2xl
- Card titles:     Syne 700, text-lg
- Body text:       DM Sans 400, text-sm to text-base
- Labels/tags:     DM Sans 500, text-xs, tracking-widest, uppercase
```

### Geometric Accent Pattern
All cards and hero sections should use a **subtle Islamic geometric SVG pattern** as background overlay at 3-5% opacity. Use an 8-pointed star / arabesque tiling pattern in the primary green color.

```jsx
// Reusable geometric overlay component
const GeometricOverlay = () => (
  <div className="absolute inset-0 opacity-[0.04] pointer-events-none overflow-hidden">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="geo" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          {/* 8-pointed star */}
          <polygon points="30,5 35,20 50,20 38,30 43,45 30,36 17,45 22,30 10,20 25,20"
            fill="none" stroke="#4ADE80" strokeWidth="0.5"/>
          <rect x="20" y="20" width="20" height="20" fill="none" stroke="#4ADE80" strokeWidth="0.3"
            transform="rotate(45 30 30)"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#geo)"/>
    </svg>
  </div>
)
```

### Component Design Rules

**Cards:**
```
bg: var(--bg-surface)
border: 1px solid var(--border)
border-radius: 16px
hover: border-color transitions to var(--border-accent), subtle translateY(-2px)
inner glow on hover: box-shadow: 0 0 30px rgba(74,222,128,0.08)
```

**Buttons (Primary):**
```
bg: #4ADE80
text: #080C0A (dark on light green)
border-radius: 12px
hover: brightness(1.1) + scale(1.02)
active: scale(0.98)
font: DM Sans 500
```

**Buttons (Secondary/Ghost):**
```
bg: transparent
border: 1px solid var(--border-accent)
text: var(--text-secondary)
hover: bg var(--bg-elevated)
```

**Tags/Badges:**
```
Small pill, uppercase, tracking-widest, text-xs
DM Sans 500
Colored variants: green (normal), amber (urgent/pinned), red (kecemasan)
bg: color at 15% opacity, text: full color
```

**Input Fields:**
```
bg: var(--bg-elevated)
border: 1px solid var(--border)
focus: border var(--primary), ring: var(--primary-glow)
text: var(--text-primary)
placeholder: var(--text-dim)
border-radius: 12px
```

### Navigation
```
Bottom nav (mobile-first):  5 icons — Home, Keperluan, Program, Kelas, Profile
Top nav (desktop):          Logo left, links center, auth right
Logo:                       "KARIAH" in Syne 800, with a subtle green dot or crescent icon
Nav bg:                     Frosted glass — backdrop-blur-xl bg-bg-base/80
Active tab:                 Green pill indicator + icon brightens
```

### Animations
```css
/* Page enter — stagger children */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fadeUp { animation: fadeUp 0.4s ease forwards; }

/* Stagger utility */
.delay-1 { animation-delay: 0.05s; }
.delay-2 { animation-delay: 0.10s; }
.delay-3 { animation-delay: 0.15s; }
.delay-4 { animation-delay: 0.20s; }

/* Pulse glow for live counters */
@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 8px rgba(74,222,128,0.3); }
  50%       { box-shadow: 0 0 20px rgba(74,222,128,0.6); }
}
.glow-pulse { animation: pulseGlow 2s ease-in-out infinite; }

/* Green dot for "live" indicators */
@keyframes ping { ... } /* Tailwind animate-ping */
```

### Hero Section (Home Page)
```
Full-width dark panel
Left side: Prayer time countdown widget — large Syne font showing next prayer name + time remaining
Right side: Arabesque geometric illustration (SVG, animated with subtle rotation)
Background: Gradient mesh + geometric pattern overlay
Below hero: Quick stats row — "X jemaah berdaftar · X program bulan ini · X keperluan diselesaikan"
```

### Prayer Times Widget
```
Horizontal scroll card row — each prayer as individual card
Active/next prayer: glowing green border, pulse animation
Past prayers: dimmed opacity
Card shows: prayer name (Arabic + BM), time
Font: Syne 700 for time, DM Sans for label
```

---

## DATABASE SCHEMA (Supabase)

Run this SQL in Supabase SQL Editor:

```sql
-- PROFILES
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  phone text,
  unit_blok text,
  role text default 'jemaah', -- 'jemaah' | 'ajk' | 'superadmin'
  avatar_url text,
  created_at timestamptz default now()
);

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Jemaah'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- MOSQUE INFO (single row)
create table mosque_info (
  id int primary key default 1,
  name text not null default 'Masjid Saujana Utama',
  address text default 'Jalan Kemboja 2, Saujana Utama 2, 47000 Sungai Buloh, Selangor',
  phone text default '012-3384586',
  description text,
  gmaps_url text default 'https://maps.google.com/?q=Masjid+Saujana+Utama+Sungai+Buloh',
  has_wudhu boolean default true,
  has_womens_section boolean default true,
  has_parking boolean default true,
  has_accessibility boolean default false,
  parking_notes text,
  operating_notes text,
  updated_at timestamptz default now()
);

insert into mosque_info (id) values (1) on conflict do nothing;

-- PRAYER TIMES
create table prayer_times (
  id uuid default gen_random_uuid() primary key,
  date date not null unique,
  fajr time not null,
  syuruk time,
  dhuhr time not null,
  asr time not null,
  maghrib time not null,
  isha time not null,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- ANNOUNCEMENTS
create table announcements (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  category text default 'umum', -- 'umum' | 'kecemasan' | 'ramadan' | 'kewangan'
  is_pinned boolean default false,
  expires_at timestamptz,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- KEPERLUAN KOMUNITI
create table keperluan (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  category text not null, -- 'bantuan_fizikal' | 'ilmu_tuisyen' | 'transport' | 'barangan' | 'lain'
  urgency text default 'normal', -- 'normal' | 'urgent'
  status text default 'pending', -- 'pending' | 'open' | 'in_progress' | 'resolved'
  posted_by uuid references profiles(id),
  approved_by uuid references profiles(id),
  approved_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz default now()
);

create table keperluan_helpers (
  id uuid default gen_random_uuid() primary key,
  keperluan_id uuid references keperluan(id) on delete cascade,
  helper_id uuid references profiles(id),
  message text,
  created_at timestamptz default now(),
  unique(keperluan_id, helper_id)
);

-- PROGRAMS (events + volunteer)
create table programs (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  category text default 'umum', -- 'solat' | 'kebajikan' | 'ramadan' | 'gotong_royong' | 'umum'
  program_date date not null,
  start_time time not null,
  end_time time,
  location text,
  needs_volunteers boolean default false,
  volunteer_slots int default 0,
  is_published boolean default true,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table volunteer_signups (
  id uuid default gen_random_uuid() primary key,
  program_id uuid references programs(id) on delete cascade,
  user_id uuid references profiles(id),
  status text default 'confirmed', -- 'confirmed' | 'cancelled'
  created_at timestamptz default now(),
  unique(program_id, user_id)
);

-- KELAS (classes with booking)
create table kelas (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  ustaz_name text,
  category text default 'quran', -- 'quran' | 'fiqh' | 'akhlak' | 'bahasa_arab' | 'lain'
  schedule_day text,
  start_date date,
  end_date date,
  time_start time,
  time_end time,
  location text,
  capacity int,
  is_active boolean default true,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table kelas_bookings (
  id uuid default gen_random_uuid() primary key,
  kelas_id uuid references kelas(id) on delete cascade,
  user_id uuid references profiles(id),
  status text default 'active', -- 'active' | 'cancelled'
  created_at timestamptz default now(),
  unique(kelas_id, user_id)
);
```

---

## RLS POLICIES

```sql
-- Enable RLS on all tables
alter table profiles enable row level security;
alter table mosque_info enable row level security;
alter table prayer_times enable row level security;
alter table announcements enable row level security;
alter table keperluan enable row level security;
alter table keperluan_helpers enable row level security;
alter table programs enable row level security;
alter table volunteer_signups enable row level security;
alter table kelas enable row level security;
alter table kelas_bookings enable row level security;

-- PROFILES
create policy "Public read profiles" on profiles for select using (true);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);
create policy "Users insert own profile" on profiles for insert with check (auth.uid() = id);

-- MOSQUE INFO & PRAYER TIMES (public read)
create policy "Public read mosque_info" on mosque_info for select using (true);
create policy "AJK manage mosque_info" on mosque_info for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('ajk','superadmin'))
);
create policy "Public read prayer_times" on prayer_times for select using (true);
create policy "AJK manage prayer_times" on prayer_times for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('ajk','superadmin'))
);

-- ANNOUNCEMENTS
create policy "Public read announcements" on announcements for select using (true);
create policy "AJK manage announcements" on announcements for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('ajk','superadmin'))
);

-- KEPERLUAN
create policy "Read approved keperluan" on keperluan for select using (
  status != 'pending'
  or posted_by = auth.uid()
  or exists (select 1 from profiles where id = auth.uid() and role in ('ajk','superadmin'))
);
create policy "Auth users post keperluan" on keperluan for insert with check (auth.uid() is not null);
create policy "Owner or AJK update keperluan" on keperluan for update using (
  posted_by = auth.uid()
  or exists (select 1 from profiles where id = auth.uid() and role in ('ajk','superadmin'))
);
create policy "Public read helpers" on keperluan_helpers for select using (true);
create policy "Auth users offer help" on keperluan_helpers for insert with check (auth.uid() is not null);
create policy "Remove own help offer" on keperluan_helpers for delete using (helper_id = auth.uid());

-- PROGRAMS
create policy "Public read published programs" on programs for select using (is_published = true);
create policy "AJK manage programs" on programs for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('ajk','superadmin'))
);
create policy "Read own or AJK volunteer signups" on volunteer_signups for select using (
  user_id = auth.uid()
  or exists (select 1 from profiles where id = auth.uid() and role in ('ajk','superadmin'))
);
create policy "Auth users signup volunteer" on volunteer_signups for insert with check (auth.uid() is not null);
create policy "Users cancel own signup" on volunteer_signups for update using (user_id = auth.uid());

-- KELAS
create policy "Public read active kelas" on kelas for select using (is_active = true);
create policy "AJK manage kelas" on kelas for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('ajk','superadmin'))
);
create policy "Read own or AJK bookings" on kelas_bookings for select using (
  user_id = auth.uid()
  or exists (select 1 from profiles where id = auth.uid() and role in ('ajk','superadmin'))
);
create policy "Auth users book kelas" on kelas_bookings for insert with check (auth.uid() is not null);
create policy "Users cancel own booking" on kelas_bookings for update using (user_id = auth.uid());
```

---

## FOLDER STRUCTURE

```
/app
  layout.tsx              ← Global layout, fonts, nav
  page.tsx                ← Home — prayer times + announcements + stats
  /keperluan
    page.tsx              ← Community board (public view)
    /new
      page.tsx            ← Post new keperluan (auth required)
    /[id]
      page.tsx            ← Single keperluan detail
  /program
    page.tsx              ← All programs + volunteer signup
    /[id]
      page.tsx            ← Single program detail
  /kelas
    page.tsx              ← All kelas + booking
    /[id]
      page.tsx            ← Single kelas detail
  /masjid
    page.tsx              ← Mosque info, facilities, map
  /profile
    page.tsx              ← User profile + history (auth required)
  /admin
    layout.tsx            ← AJK role guard
    page.tsx              ← Dashboard overview
    /mosque
      page.tsx            ← Edit mosque info + prayer times
    /announcements
      page.tsx            ← Manage announcements
    /keperluan
      page.tsx            ← Approve/manage keperluan
    /programs
      page.tsx            ← Manage programs
    /kelas
      page.tsx            ← Manage kelas
  /auth
    /callback
      page.tsx            ← Supabase OAuth callback handler

/components
  /ui
    Button.tsx
    Card.tsx
    Badge.tsx
    Input.tsx
    Modal.tsx
    GeometricOverlay.tsx  ← Islamic pattern SVG overlay
    PrayerCard.tsx        ← Individual prayer time card
    CountdownTimer.tsx    ← Next prayer countdown
  /layout
    Navbar.tsx            ← Top nav (desktop) + Bottom nav (mobile)
    PageHeader.tsx
  /sections
    HeroSection.tsx       ← Prayer countdown + stats
    AnnouncementFeed.tsx
    KeperluanBoard.tsx
    ProgramGrid.tsx
    KelasList.tsx

/lib
  supabase.ts             ← createClient (browser)
  supabase-server.ts      ← createServerClient
  auth.ts                 ← Auth helpers
  utils.ts                ← cn(), formatDate(), etc

/hooks
  useUser.ts
  usePrayerTimes.ts
  useRealtime.ts          ← Supabase realtime subscriptions

/types
  database.types.ts       ← Generated Supabase types
```

---

## PAGE-BY-PAGE DESIGN SPEC

### HOME PAGE (`/`)
```
Layout:
  [Hero] — full-width, dark bg with mesh gradient
    Left: "WAKTU SOLAT" label (uppercase, text-dim, tracking-widest)
          Next prayer name in Arabic + BM (Syne 800, text-5xl, green)
          Countdown timer (Syne 700, text-3xl, text-secondary)
    Right: Animated arabesque SVG (subtle rotation, opacity-20)
    Bottom: 3-col stat strip — "142 Jemaah · 8 Program · 24 Keperluan Selesai"

  [Prayer Times Row] — horizontal scroll on mobile, grid on desktop
    6 cards (Subuh, Syuruk, Zohor, Asr, Maghrib, Isyak)
    Next prayer card: glowing green border + pulse
    Past prayers: opacity-40

  [Announcements] — latest 3, with "pinned" badge in amber for pinned ones
    Card with category badge, title (Syne 700), excerpt, timestamp

  [Quick Access Grid] — 4 large icon buttons
    Keperluan Komuniti | Daftar Volunteer | Tempah Kelas | Info Masjid
```

### KEPERLUAN PAGE (`/keperluan`)
```
Layout:
  Header: "KEPERLUAN KOMUNITI" title + "Post Keperluan" CTA button (top right)
  Filter tabs: Semua | Bantuan | Ilmu | Transport | Barangan
  Urgency filter: toggle for Urgent only

  Cards grid (2-col mobile, 3-col desktop):
    Each card:
      - Category badge (top left) + Urgency badge amber if urgent (top right)
      - Title (Syne 700)
      - Description excerpt (DM Sans, text-secondary, 2 lines)
      - Posted by: avatar initial circle + name
      - Helper count: "3 orang nak bantu" with green icon
      - "Saya Boleh Bantu" button — ghost style, full width on mobile
      - Status indicator bottom: green dot = open, amber = in progress

  Empty state: encouraging message + CTA to post first keperluan
```

### PROGRAM PAGE (`/program`)
```
Layout:
  Header: "PROGRAM & SUKARELA"
  Filter: Semua | Ramadan | Kebajikan | Gotong Royong

  Upcoming programs list:
    Each card:
      - Date chip (left edge, vertical, abbreviated month + day)
      - Title (Syne 700)
      - Time + Location row (icons + DM Sans)
      - Volunteer badge if needs_volunteers: "Perlu X Sukarelawan"
      - Slot counter: live "7/10 slots" with progress bar (green fill)
      - "Daftar Sukarela" button if slots available

  Past programs: separate section, dimmed cards
```

### KELAS PAGE (`/kelas`)
```
Layout:
  Header: "KELAS & ILMU"
  Each kelas as horizontal card (list view):
    - Left: colored category dot + day badge
    - Center: title (Syne 700), ustaz name, time
    - Right: capacity pill "12/20 tempat" + "Tempah" button

  Detail modal/page:
    Full description, schedule, ustaz bio, booking confirmation
```

### MASJID INFO PAGE (`/masjid`)
```
Layout:
  Top: Mosque name large (Syne 800), address, phone
  Facilities grid: icon + label cards (wudhu, wanita, parking, accessibility)
  Google Maps embed or link button
  Operating notes
  Contact CTA
```

### ADMIN DASHBOARD (`/admin`)
```
Layout: Sidebar nav (desktop) / top tabs (mobile)
Stats cards row: Total users, Active keperluan, Volunteer signups, Kelas bookings
Tables for each module with quick action buttons
Forms for creating/editing content
```

---

## KRACKEDDEVS PROMO SECTION (Required by RC26)

Add to footer of every page AND as `/tentang` route:

```tsx
<section className="border border-border rounded-2xl p-6 bg-bg-surface relative overflow-hidden">
  <GeometricOverlay />
  <div className="flex items-center gap-4 mb-3">
    {/* KrackedDevs logo — use text if no image */}
    <div className="font-display font-bold text-xl text-primary">KrackedDevs</div>
    <Badge variant="green">RC26</Badge>
  </div>
  <p className="text-text-secondary text-sm mb-4">
    Sajda dibina sempena Ramadan Challenge 2026 oleh KrackedDevs —
    komuniti developer Malaysia yang build real products untuk real users.
  </p>
  <a href={REFERRAL_LINK} className="btn-primary text-sm">
    Sertai KrackedDevs →
  </a>
</section>
```

---

## ENVIRONMENT VARIABLES

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_KRACKEDDEVS_REFERRAL=your_referral_link
```

---

## SUPABASE SETUP CHECKLIST

- [ ] Enable Email auth provider
- [ ] Enable Google OAuth provider (add Client ID + Secret)
- [ ] Set Site URL: https://your-app.vercel.app
- [ ] Add redirect URL: https://your-app.vercel.app/auth/callback
- [ ] Run full SQL schema (tables + RLS)
- [ ] Insert initial mosque_info row
- [ ] Manually set own profile role to 'superadmin' after first login:
      `update profiles set role = 'superadmin' where id = 'your-user-id';`

---

## KEY BUSINESS RULES

1. **Guest users** can view all published content but cannot interact (no posting, no signing up)
2. **Keperluan** must be approved by AJK before appearing publicly (status: pending → open)
3. **Volunteer slots** — if volunteer_slots = 0, it means unlimited slots
4. **Prayer times** — AJK inputs manually; show today's times or fallback to latest available
5. **Role escalation** — new users default to 'jemaah'; AJK role only granted by superadmin via SQL or admin UI
6. **Realtime** — use Supabase realtime for: volunteer slot counter, keperluan helper count, new announcements

---

## IMPORTANT CONTEXT

- Masjid Saujana Utama serves ~50,000 residents in Bandar Saujana Utama
- The mosque already has donation system (dana.masjidsaujanautama.com) — do NOT build donation feature
- Main pain points: engaging muslimat & youth, coordinating volunteers, community disconnection
- App must feel modern enough that young people (18-30) want to use it daily
- Growth strategy: AJK posts volunteer slot → shares link in WhatsApp group → jemaah sign up → 10 users in 2 days

---

## WINNING STRATEGY NOTES

**Most Useful (40%):** Keperluan komuniti + volunteer slots are genuinely new for Malaysian mosques  
**Best Design (30%):** Sacred Futurism aesthetic — judges have never seen a mosque app look this good  
**Growth Award (30%):** Volunteer signup creates natural viral loop — AJK shares, jemaah signs up, done


# SAJDA — Islamic Community Platform

## Documentation
- Full SRS: /docs/SAJDA_SRS_v1_0.pdf
- Current database schema: /docs/schema.sql

## Current state
- Hackathon MVP for Masjid Saujana Utama
- Landing page exists with pricing — needs UI overhaul
- Billplz code exists but not connected to sandbox
- Stack: Next.js 14, Supabase, Tailwind, Vercel

## Priority right now
1. UI redesign — Sacred Futurism theme
2. Billplz sandbox connection
3. Phase 1 features per SRS

## Design system
- Primary: #3DFF8F (sacred green)
- Background: #0A1628 (near-black)  
- Fonts: Syne (headings), DM Sans (body)
- Style: professional SaaS, not student project
---

*Built with ❤️ for RC26 — Ramadan Challenge 2026 by KrackedDevs*
*Selamat Beribadah.*
