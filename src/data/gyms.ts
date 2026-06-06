import type {
  ExperienceLevel,
  FightAccess,
  GymEditorial,
  GymGoogle,
  KnownForTag,
  PriceRange,
  Trainer,
} from "@/lib/types";
import { CITIES } from "@/data/cities";

// ============================================================================
// SEED DATA — READ BEFORE EDITING
// ----------------------------------------------------------------------------
// Each gym is one compact `Spec`. The builders below derive the editorial
// record, the placeholder Google block, and the fight-access entry from it.
//
// • Gym NAMES and CITIES are real; notable facts are researched from public
//   Muay Thai guides. PRICES, coordinates and ratings are ESTIMATES /
//   placeholders until the Google Places API (M5) fills them in by real
//   place_id. Fight-access is an honest reputation-based estimate — verify.
// • Add a photo: drop /public/gyms/<gym-id>.jpg (auto-detected).
// • Add a gym: copy a Spec, give it a unique `id`, set `city` to a slug in
//   data/cities.ts. That's it.
// ============================================================================

type Spec = {
  id: string;
  name: string;
  city: string; // City.slug
  lat: number;
  lng: number;
  rating: number;
  reviews: number;
  level: ExperienceLevel;
  fighters: boolean;
  accom: boolean;
  price: PriceRange;
  priceNote?: string;
  fight: FightAccess;
  fightNote: string;
  tags: KnownForTag[];
  style: string;
  desc: string;
  trainers?: Trainer[];
  /** Editorial reviewed by a human (default true). New seeds set false. */
  verified?: boolean;
  /** Coordinates confirmed (default true). Set false when only area-accurate. */
  coordsVerified?: boolean;
  /** Stadiums / promotions where this gym's fighters regularly compete. */
  stadiums?: string[];
  /** Instagram handle without @. */
  instagram?: string;
  /** LINE ID for direct contact. */
  line_id?: string;
};

const SPECS: Spec[] = [
  // ============================ BANGKOK ============================
  {
    id: "fa-group", name: "FA Group", city: "bangkok",
    lat: 13.715, lng: 100.598, rating: 4.8, reviews: 320,
    level: "advanced", fighters: true, accom: false, price: "$", priceNote: "~350 THB/session",
    fight: "quick", fightNote: "Real fight gym — capable trainees can get matched within a week or two.",
    tags: ["fighter-focused", "clinch", "authentic"],
    style: "Clinch-heavy stadium-fighter development.",
    desc: "A hard Phra Khanong fight gym, not a fitness studio. Built around relentless clinch and high-volume sparring, with active stadium fighters in the room daily. Beginners are allowed but it's sink-or-swim — best if you already train.",
    trainers: [{ name: "Kru Dtee", note: "Ex-stadium fighter, clinch specialist" }],
    stadiums: ["Rangsit Stadium", "Channel 7 Boxing Stadium"],
    instagram: "fagroupmuaythai",
  },
  {
    id: "kaewsamrit", name: "Kaewsamrit Gym", city: "bangkok",
    lat: 13.69, lng: 100.49, rating: 4.7, reviews: 180,
    level: "advanced", fighters: true, accom: false, price: "$", priceNote: "~400 THB/session",
    fight: "quick", fightNote: "Fighter camp; fights arranged readily once you can hold your own.",
    tags: ["fighter-focused", "technical", "authentic"],
    style: "Power-punching lineage with brutal conditioning.",
    desc: "Old-school Bangkok camp famous for punching power and heavy conditioning. Real fighters train here every day — you come to be pushed, not pampered. Better suited to intermediate level and up.",
    stadiums: ["Lumpinee Boxing Stadium", "Rajadamnern Stadium"],
    instagram: "kaewsamrit_gym",
  },
  {
    id: "sor-vorapin", name: "Sor Vorapin Gym", city: "bangkok",
    lat: 13.762, lng: 100.497, rating: 4.5, reviews: 240,
    level: "mixed", fighters: true, accom: false, price: "$$", priceNote: "~500 THB/session",
    fight: "standard", fightNote: "Will put keen students on local cards after a few weeks of training.",
    tags: ["beginner-friendly", "tourist-friendly", "technical"],
    style: "Foundational Muay Thai with a route to competing.",
    desc: "An old-town gym that's spent decades teaching foreigners the basics while still running a fight team. Genuinely beginner-friendly and central, with a clear path forward if you want to progress toward fighting.",
    stadiums: ["Rajadamnern Stadium", "Local Bangkok cards"],
    instagram: "sorvorapinmuaythai",
  },
  {
    id: "sasiprapa", name: "Sasiprapa Gym", city: "bangkok",
    lat: 13.802, lng: 100.56, rating: 4.6, reviews: 95,
    level: "mixed", fighters: true, accom: false, price: "$$", priceNote: "~500 THB/session",
    fight: "standard", fightNote: "Has a fight team; books fights after some training and a look at you.",
    tags: ["technical", "conditioning", "tourist-friendly"],
    style: "Structured, technique-first training for all levels.",
    desc: "A balanced camp with a working fight team and structured, technique-first pad rounds. Takes beginners seriously without dumbing it down — an all-rounder rather than a hardcore or holiday gym.",
    instagram: "sasiprapa.gym",
  },
  {
    id: "petchyindee-academy", name: "Petchyindee Academy", city: "bangkok",
    lat: 13.765, lng: 100.61, rating: 4.8, reviews: 420,
    level: "mixed", fighters: true, accom: false, price: "$$", priceNote: "~600 THB/session · ~15,000 THB/month",
    fight: "selective", fightNote: "Elite room — fights are for those who can match the level.",
    tags: ["fighter-focused", "technical", "authentic"],
    style: "Sports-science training on a championship pedigree.",
    desc: "A championship institution (since 1976) that helped modernise Thai training and produced world champs like Petchmorakot. Resident pros and serious technique; visitors are welcome but the standard is high.",
    trainers: [{ name: "Petchyindee coaching team" }],
    stadiums: ["Lumpinee Boxing Stadium", "ONE Championship"],
    instagram: "petchyindee_academy",
  },
  {
    id: "pk-saenchai", name: "P.K. Saenchai Muay Thai Gym", city: "bangkok",
    lat: 13.8, lng: 100.4, rating: 4.8, reviews: 260,
    level: "advanced", fighters: true, accom: false, price: "$$", priceNote: "~600 THB/session · ~15,000 THB/month",
    fight: "selective", fightNote: "Top pros only; not a walk-in route to a fight.",
    tags: ["fighter-focused", "technical", "conditioning"],
    style: "Elite fight-team training across Muay Thai, boxing and MMA.",
    desc: "Home to some of the sport's biggest active names (Tawanchai, Prajanchai). This is an elite fight team first — four rings, brutal standards. Best for experienced trainers and aspiring fighters, not first-timers.",
    stadiums: ["Lumpinee Boxing Stadium", "ONE Championship", "GLORY Kickboxing"],
    instagram: "pkmuaythai",
  },
  {
    id: "bangkok-fight-lab", name: "Bangkok Fight Lab", city: "bangkok",
    lat: 13.7, lng: 100.59, rating: 4.7, reviews: 350,
    level: "mixed", fighters: true, accom: false, price: "$$", priceNote: "~500 THB/session · ~12,000 THB/month",
    fight: "standard", fightNote: "Arranges fights and smokers for committed members.",
    tags: ["tourist-friendly", "technical", "conditioning"],
    style: "Modern multi-discipline academy for all levels.",
    desc: "A modern central gym that trains pro fighters across Muay Thai, boxing and grappling. Polished and beginner-accessible, with real competitors to learn from — good if you want quality coaching without a remote camp.",
    instagram: "bangkokfightlab",
  },
  {
    id: "jitti-gym", name: "Jitti Gym", city: "bangkok",
    lat: 13.755, lng: 100.535, rating: 4.7, reviews: 180,
    level: "mixed", fighters: true, accom: false, price: "$", priceNote: "~350 THB/session",
    fight: "quick", fightNote: "Traditional fight gym; matches capable trainees quickly.",
    tags: ["fighter-focused", "technical", "authentic"],
    style: "Traditional, discipline-first Thai boxing.",
    desc: "A no-frills traditional Thai gym focused on technique and discipline, with a track record of producing fighters. Authentic and demanding — not built for hand-holding, but solid if you want the real thing.",
    stadiums: ["Rajadamnern Stadium", "Channel 7 Boxing Stadium"],
    instagram: "jettigym",
  },
  {
    id: "master-toddys", name: "Master Toddy's Muay Thai Academy", city: "bangkok",
    lat: 13.78, lng: 100.565, rating: 4.5, reviews: 220,
    level: "beginner", fighters: false, accom: false, price: "$$", priceNote: "~500 THB/session · ~12,000 THB/month",
    fight: "standard", fightNote: "Will set up fights for students who put the work in.",
    tags: ["beginner-friendly", "tourist-friendly", "technical"],
    style: "Internationally-minded coaching, beginner to pro.",
    desc: "Best known for coaching foreigners and even MMA names, with a strong beginner and women's program. Less a hardcore stadium camp, more a place to actually learn from scratch with structure.",
    trainers: [{ name: "Grand Master Toddy", note: "Coached MMA legends" }],
    instagram: "mastertoddys",
  },
  {
    id: "kru-dam", name: "Kru Dam Muay Thai", city: "bangkok",
    lat: 13.745, lng: 100.55, rating: 4.8, reviews: 300,
    level: "mixed", fighters: true, accom: false, price: "$$", priceNote: "~500 THB/session · ~12,000 THB/month",
    fight: "standard", fightNote: "Books fights once you've trained and shown you're ready.",
    tags: ["beginner-friendly", "technical", "authentic"],
    style: "Welcoming yet serious training under a national-level coach.",
    desc: "A central camp under a national-level coach that bridges first-timers and competitors. Beginner-friendly, but with real fighters around, so the ceiling is high if you stick with it.",
    trainers: [{ name: "Coach Dam Srichan", note: "National-level trainer" }],
    instagram: "krudam_muaythai",
  },

  // ============================ PATTAYA ============================
  {
    id: "fairtex-pattaya", name: "Fairtex Pattaya", city: "pattaya",
    lat: 12.94, lng: 100.9, rating: 4.6, reviews: 900,
    level: "mixed", fighters: true, accom: true, price: "$$$", priceNote: "resort packages (placeholder)",
    fight: "standard", fightNote: "Big-brand camp with a pro team; fights arranged after assessment.",
    tags: ["tourist-friendly", "conditioning", "private-sessions"],
    style: "Large international brand camp with a pro fight team.",
    desc: "One of the most respected names in Muay Thai (since 1971), with modern facilities, on-site accommodation and a real pro team. Caters heavily to travellers, but the standard is high if you want to push.",
  },
  {
    id: "sityodtong-pattaya", name: "Sityodtong Muay Thai Camp", city: "pattaya",
    lat: 12.93, lng: 100.89, rating: 4.7, reviews: 350,
    level: "advanced", fighters: true, accom: true, price: "$$", priceNote: "estimate (placeholder)",
    fight: "quick", fightNote: "Historic fighter camp; capable trainees get matched readily.",
    tags: ["fighter-focused", "authentic", "technical"],
    style: "Historic Yodtong fighter lineage (since 1959).",
    desc: "Founded in 1959 by Grandmaster Yodtong, this camp has produced 57 champions and trained legends like Ramon Dekkers. A serious, traditional fighter camp that still welcomes committed foreigners.",
  },
  {
    id: "venum-training-camp", name: "Venum Training Camp", city: "pattaya",
    lat: 12.91, lng: 100.88, rating: 4.6, reviews: 600,
    level: "mixed", fighters: true, accom: true, price: "$$$", priceNote: "packages (placeholder)",
    fight: "standard", fightNote: "Will arrange fights for committed members.",
    tags: ["tourist-friendly", "conditioning", "private-sessions"],
    style: "Modern Muay Thai + MMA training camp.",
    desc: "A modern, well-equipped camp (opened 2016) founded by French champion Mehdi Zatout, covering Muay Thai, MMA and BJJ with on-site facilities. Polished and accessible for travellers of any level.",
  },
  {
    id: "petchrungruang", name: "Petchrungruang Gym", city: "pattaya",
    lat: 12.925, lng: 100.875, rating: 4.7, reviews: 130,
    level: "mixed", fighters: true, accom: false, price: "$", priceNote: "estimate (placeholder)",
    fight: "quick", fightNote: "Authentic family fight gym; matched if you can go.",
    tags: ["fighter-focused", "authentic", "clinch"],
    style: "Close-knit traditional fighter gym (since 1986).",
    desc: "A family-run gym with a close-knit, old-school atmosphere and real fighters in the room. Authentic and welcoming to dedicated trainees rather than a polished tourist operation.",
  },
  {
    id: "sor-klinmee", name: "Sor Klinmee Muay Thai", city: "pattaya",
    lat: 12.95, lng: 100.91, rating: 4.7, reviews: 200,
    level: "mixed", fighters: true, accom: true, price: "$$", priceNote: "estimate (placeholder)",
    fight: "standard", fightNote: "Books fights for capable, committed trainees.",
    tags: ["authentic", "technical", "conditioning"],
    style: "Traditional training under a former champion.",
    desc: "Founded by former champion Mit Klinmee, focused on authentic technique, conditioning and sparring for all levels — a solid traditional option away from the biggest brand camps.",
  },
  {
    id: "rambaa-m16", name: "Rambaa Somdet M16 Gym", city: "pattaya",
    lat: 12.9, lng: 100.87, rating: 4.7, reviews: 150,
    level: "advanced", fighters: true, accom: false, price: "$", priceNote: "estimate (placeholder)",
    fight: "quick", fightNote: "Old-school fight gym; capable trainees matched fast.",
    tags: ["fighter-focused", "authentic", "clinch"],
    style: "Old-school no-nonsense fight gym.",
    desc: "Run by Muay Thai and MMA legend Rambaa 'M16' Somdet, with a no-nonsense, old-school approach and an MMA cage alongside the ring. For people who want to train hard, not be entertained.",
  },

  // ============================ HUA HIN ============================
  {
    id: "huahin-fightgear", name: "Hua Hin Fight Gear", city: "hua-hin",
    lat: 12.57, lng: 99.96, rating: 4.7, reviews: 120,
    level: "mixed", fighters: true, accom: false, price: "$$", priceNote: "estimate (placeholder)",
    fight: "standard", fightNote: "Will sort fights for keen trainees on local cards.",
    tags: ["tourist-friendly", "technical", "conditioning"],
    style: "Welcoming Hua Hin training base.",
    desc: "A friendly Hua Hin gym and training base that mixes solid Muay Thai coaching with a welcoming vibe for visitors. A good entry point to the growing Hua Hin scene.",
  },
  {
    id: "elite-fight-club-huahin", name: "Elite Fight Club Hua Hin", city: "hua-hin",
    lat: 12.58, lng: 99.97, rating: 4.7, reviews: 200,
    level: "mixed", fighters: true, accom: true, price: "$$$", priceNote: "resort packages (placeholder)",
    fight: "standard", fightNote: "Arranges fights for committed members.",
    tags: ["tourist-friendly", "conditioning", "private-sessions"],
    style: "Premium resort-style training.",
    desc: "A premium resort-style facility with world-class coaches, Muay Thai plus CrossFit and recovery, set in a natural resort setting. Polished and traveller-focused.",
  },
  {
    id: "pro-muay-thai-huahin", name: "Pro Muay Thai Gym Hua Hin", city: "hua-hin",
    lat: 12.55, lng: 99.95, rating: 4.8, reviews: 250,
    level: "mixed", fighters: true, accom: false, price: "$$", priceNote: "estimate (placeholder)",
    fight: "standard", fightNote: "Trains novices to pros; will book fights for the ready.",
    tags: ["technical", "beginner-friendly", "conditioning"],
    style: "Authentic Muay Thai & fitness, all levels.",
    desc: "An authentic Muay Thai and fitness gym taking people from total beginner to pro fighter, with customised training. A genuine local option rather than a holiday-resort setup.",
  },
  {
    id: "grand-thai-boxing-huahin", name: "Grand Thai Boxing Hua Hin", city: "hua-hin",
    lat: 12.565, lng: 99.958, rating: 4.5, reviews: 120,
    level: "mixed", fighters: true, accom: false, price: "$$", priceNote: "estimate (placeholder)",
    fight: "quick", fightNote: "Runs its own weekly fight nights — a real route to a bout.",
    tags: ["authentic", "tourist-friendly", "conditioning"],
    style: "Gym with its own regular fight nights.",
    desc: "A central Hua Hin gym that hosts its own Muay Thai fight nights twice a week — so there's a clear, quick path from training to actually stepping in the ring.",
  },

  // ============================ KORAT ============================
  {
    id: "kem-muay-thai", name: "Kem Muay Thai Gym", city: "korat",
    lat: 14.98, lng: 102.1, rating: 4.9, reviews: 300,
    level: "mixed", fighters: true, accom: true, price: "$$", priceNote: "training+stay (placeholder)",
    fight: "standard", fightNote: "Champion-owned camp; fights for those who train up.",
    tags: ["fighter-focused", "authentic", "conditioning"],
    style: "Champion-owned countryside camp (Kem Sitsongpeenong).",
    desc: "A family-run camp owned by Muay Thai superstar Kem Sitsongpeenong, set in the countryside near Khao Yai. Authentic Isaan training with accommodation — serious but welcoming to dedicated foreigners.",
  },

  // ============================ BURIRAM ============================
  {
    id: "kiat-moo-kao", name: "Kiat Moo Kao", city: "buriram",
    lat: 14.99, lng: 103.1, rating: 4.7, reviews: 80,
    level: "advanced", fighters: true, accom: false, price: "$", priceNote: "estimate (placeholder)",
    fight: "quick", fightNote: "Historic feeder gym; a real fighter pipeline.",
    tags: ["fighter-focused", "authentic", "clinch"],
    style: "Historic Buriram fighter feeder camp.",
    desc: "One of the most historic gyms in Thailand — a golden-era feeder that trained future Bangkok champions as schoolboys. Deep in the Isaan heartland; pure traditional fighter culture.",
  },

  // ============================ KHON KAEN ============================
  {
    id: "gumpun-muaythai", name: "Gumpun Muaythai", city: "khon-kaen",
    lat: 16.44, lng: 102.84, rating: 4.7, reviews: 90,
    level: "mixed", fighters: true, accom: true, price: "$", priceNote: "long-stay options (placeholder)",
    fight: "standard", fightNote: "Will arrange local fights for trainees who put the work in.",
    tags: ["authentic", "conditioning", "technical"],
    style: "Khon Kaen camp with long-stay options.",
    desc: "An authentic Khon Kaen camp offering real Isaan training with long-stay and visa-friendly options — affordable, off the tourist trail, in one of Thailand's great fighter-producing provinces.",
  },

  // ============================ UDON THANI ============================
  {
    id: "siriluck-muay-thai", name: "Siriluck Muay Thai", city: "udon-thani",
    lat: 17.41, lng: 102.79, rating: 4.8, reviews: 150,
    level: "mixed", fighters: true, accom: true, price: "$", priceNote: "great value (placeholder)",
    fight: "standard", fightNote: "Champion-led, licensed camp; books fights for the ready.",
    tags: ["authentic", "technical", "beginner-friendly"],
    style: "Champion-led camp, all levels, excellent value.",
    desc: "A licensed, champion-led camp minutes from the city centre that welcomes all levels. Strong Isaan training at some of the best value in the country, with accommodation on offer.",
  },
  {
    id: "fight-club-udon", name: "Fight Club Muay Thai Udon Thani", city: "udon-thani",
    lat: 17.42, lng: 102.78, rating: 4.8, reviews: 120,
    level: "mixed", fighters: true, accom: false, price: "$", priceNote: "estimate (placeholder)",
    fight: "standard", fightNote: "Beginner to fighter; arranges local bouts for the ready.",
    tags: ["authentic", "technical", "conditioning"],
    style: "Traditional + modern training, beginner to fighter.",
    desc: "A premier Udon Thani gym blending traditional Muay Thai with modern methods, from fundamentals for beginners to fight prep — authentic and supportive.",
  },

  // ============================ UBON RATCHATHANI ============================
  {
    id: "santi-ubon", name: "Santi Ubon Muay Thai", city: "ubon-ratchathani",
    lat: 15.24, lng: 104.85, rating: 4.7, reviews: 100,
    level: "mixed", fighters: true, accom: true, price: "$", priceNote: "estimate (placeholder)",
    fight: "quick", fightNote: "Real fighter camp; matched if you can go.",
    tags: ["fighter-focused", "authentic", "conditioning"],
    style: "Authentic Isaan fighter camp.",
    desc: "A central Ubon camp producing rising stadium stars (like Dokmaypah) while welcoming people who just want authentic training or fitness. The real cradle-of-Muay-Thai experience.",
  },
  {
    id: "legacy-gym-ubon", name: "Legacy Gym Ubon", city: "ubon-ratchathani",
    lat: 15.25, lng: 104.84, rating: 4.7, reviews: 110,
    level: "mixed", fighters: true, accom: true, price: "$$", priceNote: "estimate (placeholder)",
    fight: "standard", fightNote: "Foreigner-friendly; arranges fights for committed trainees.",
    tags: ["tourist-friendly", "technical", "conditioning"],
    style: "Foreigner-friendly MMA + Muay Thai camp.",
    desc: "Owned by former world champion Ole 'Iron Fist' Laursen, this Ubon camp blends Muay Thai and MMA and is well set up for foreigners who want authentic Isaan training with support.",
  },
  {
    id: "look-nungubon", name: "Look Nungubon Muay Thai", city: "ubon-ratchathani",
    lat: 15.23, lng: 104.86, rating: 4.8, reviews: 60,
    level: "mixed", fighters: true, accom: false, price: "$", priceNote: "estimate (placeholder)",
    fight: "standard", fightNote: "Grassroots gym; will arrange local fights for trainees.",
    tags: ["authentic", "technical"],
    style: "Grassroots no-frills traditional gym.",
    desc: "A traditional, grassroots gym run by living-legend owner Nungubon — kind, welcoming and utterly no-frills. One afternoon session a day; the genuine article.",
  },
  {
    id: "phetching-muay-thai", name: "Phetching Muay Thai", city: "ubon-ratchathani",
    lat: 15.26, lng: 104.83, rating: 4.7, reviews: 70,
    level: "mixed", fighters: true, accom: true, price: "$", priceNote: "live-in (placeholder)",
    fight: "standard", fightNote: "Rural live-in camp; fights for those who train up.",
    tags: ["authentic", "conditioning"],
    style: "Rural live-in countryside camp.",
    desc: "Set 15km out in the rural countryside, a genuine live-and-train experience away from everything — authentic Isaan immersion for those who want the real, quiet version.",
  },

  // ============================ PHUKET ============================
  {
    id: "tiger-muay-thai", name: "Tiger Muay Thai", city: "phuket",
    lat: 7.842, lng: 98.337, rating: 4.6, reviews: 1500,
    level: "mixed", fighters: true, accom: true, price: "$$", priceNote: "~500 THB/session · ~25,000 THB/month",
    fight: "standard", fightNote: "Busy fight program; matched after a quick assessment — fast if experienced.",
    tags: ["tourist-friendly", "conditioning", "private-sessions"],
    style: "Large-scale camp with beginner-to-fighter tracks.",
    desc: "Thailand's biggest training complex — dozens of rings, every level, on-site everything. It runs a genuine pro fight team, but the real draw is structured group classes for travellers. Great for beginners; can feel like a factory.",
    stadiums: ["Bangla Boxing Stadium", "Patong Boxing Stadium"],
    instagram: "tigermuaythai",
  },
  {
    id: "sinbi-muay-thai", name: "Sinbi Muay Thai", city: "phuket",
    lat: 7.78, lng: 98.323, rating: 4.7, reviews: 520,
    level: "mixed", fighters: true, accom: true, price: "$$", priceNote: "~450 THB/session · ~20,000 THB/month",
    fight: "quick", fightNote: "Strong fight team; capable trainees fight readily.",
    tags: ["fighter-focused", "authentic", "clinch"],
    style: "Authentic fight-team training with room for amateurs.",
    desc: "A Rawai mainstay with an authentic fight team and strong clinch work, while still taking walk-in beginners. More serious than the average holiday camp without being closed-off.",
    stadiums: ["Bangla Boxing Stadium", "Patong Boxing Stadium"],
    instagram: "sinbimuaythai",
  },
  {
    id: "sumalee-boxing-gym", name: "Sumalee Boxing Gym", city: "phuket",
    lat: 8.02, lng: 98.325, rating: 4.9, reviews: 240,
    level: "mixed", fighters: true, accom: true, price: "$$$", priceNote: "premium packages incl. accommodation",
    fight: "standard", fightNote: "Small fight team; fights after training and the coach's nod.",
    tags: ["technical", "private-sessions", "tourist-friendly"],
    style: "Boutique, high-touch coaching with small classes.",
    desc: "A small boutique camp in the Thalang hills built around personal attention and clean technique. Has a modest fight team; ideal for beginner-to-intermediate trainers who want coaching, not crowds.",
    stadiums: ["Bangla Boxing Stadium"],
    instagram: "sumaleegym",
  },
  {
    id: "dragon-muay-thai", name: "Dragon Muay Thai", city: "phuket",
    lat: 7.846, lng: 98.341, rating: 4.5, reviews: 310,
    level: "beginner", fighters: false, accom: true, price: "$$", priceNote: "~400 THB/session",
    fight: "rare", fightNote: "Tourist/beginner focus — fights possible but not the priority.",
    tags: ["beginner-friendly", "tourist-friendly", "weight-loss"],
    style: "Approachable fundamentals for newcomers.",
    desc: "A relaxed Chalong gym aimed at newcomers and casual trainers. Friendly and easy to start at, with on-site rooms — but not a serious fighter factory, so look elsewhere if you're chasing competition.",
    instagram: "dragonmuaythai",
  },
  {
    id: "cobra-muay-thai", name: "Cobra Muay Thai", city: "phuket",
    lat: 7.846, lng: 98.338, rating: 4.9, reviews: 320,
    level: "mixed", fighters: true, accom: true, price: "$$$", priceNote: "premium packages incl. accommodation",
    fight: "standard", fightNote: "Will arrange fights for capable, committed members.",
    tags: ["technical", "tourist-friendly", "private-sessions"],
    style: "Premium coaching with championship pedigree.",
    desc: "A premium Chalong camp with champion coaches (ex-Lumpinee/Rajadamnern). Polished and beginner-accessible but with real pedigree on the pads — you're paying for quality instruction and a resort setting.",
    trainers: [{ name: "Jomhod Kiatisak", note: "Ex-Lumpinee & Rajadamnern champion" }],
    stadiums: ["Bangla Boxing Stadium", "Patong Boxing Stadium"],
    instagram: "cobramuaythai",
  },
  {
    id: "suwit-muay-thai", name: "Suwit Muay Thai", city: "phuket",
    lat: 7.852, lng: 98.335, rating: 4.6, reviews: 700,
    level: "mixed", fighters: true, accom: true, price: "$$", priceNote: "~450 THB/session · ~20,000 THB/month",
    fight: "standard", fightNote: "Fights available after training; mostly a fitness-first crowd.",
    tags: ["authentic", "conditioning", "weight-loss"],
    style: "Established all-levels camp with deep Phuket roots.",
    desc: "Phuket's original camp, 25+ years deep, strong on conditioning and fitness-driven training with on-site rooms. It has fighters, but the bread and butter is travellers getting in shape; all levels welcome.",
    stadiums: ["Bangla Boxing Stadium"],
    instagram: "suwitmuaythai",
  },
  {
    id: "aka-thailand", name: "AKA Thailand", city: "phuket",
    lat: 7.825, lng: 98.36, rating: 4.8, reviews: 600,
    level: "mixed", fighters: true, accom: true, price: "$$$", priceNote: "resort packages incl. accommodation",
    fight: "standard", fightNote: "High-performance program; fights for those who commit.",
    tags: ["conditioning", "tourist-friendly", "private-sessions"],
    style: "Award-winning Muay Thai + MMA training resort.",
    desc: "A large MMA-and-Muay-Thai resort with serious resident fighters and an award-winning reputation. Caters to everyone but shines for those who want a high-performance environment with accommodation on tap.",
    stadiums: ["Bangla Boxing Stadium", "ONE Championship (selection)"],
    instagram: "akathailand",
  },

  // ============================ KOH SAMUI ============================
  {
    id: "lamai-muay-thai", name: "Lamai Muay Thai Camp", city: "koh-samui",
    lat: 9.47, lng: 100.04, rating: 4.7, reviews: 400,
    level: "mixed", fighters: true, accom: true, price: "$$", priceNote: "estimate (placeholder)",
    fight: "standard", fightNote: "WMC camp; arranges fights for trainees who step up.",
    tags: ["authentic", "tourist-friendly", "conditioning"],
    style: "WMC-sanctioned, longest-running Samui camp.",
    desc: "The officially WMC-sanctioned camp and the longest-running gym on Samui (since 1998), a short walk from Lamai Beach. Authentic training with a genuine fight pathway.",
  },
  {
    id: "superpro-samui", name: "Superpro Samui", city: "koh-samui",
    lat: 9.49, lng: 100.05, rating: 4.7, reviews: 500,
    level: "mixed", fighters: true, accom: true, price: "$$$", priceNote: "packages (placeholder)",
    fight: "standard", fightNote: "Multi-sport gym; will arrange fights for committed members.",
    tags: ["tourist-friendly", "conditioning", "private-sessions"],
    style: "Large multi-discipline island gym.",
    desc: "A large island gym that goes well beyond Muay Thai — BJJ, MMA and a packed timetable with a talented coaching team. Polished and traveller-friendly with strong facilities.",
  },
  {
    id: "punch-it-samui", name: "Punch It Gym", city: "koh-samui",
    lat: 9.46, lng: 100.04, rating: 4.8, reviews: 200,
    level: "mixed", fighters: false, accom: false, price: "$$", priceNote: "estimate (placeholder)",
    fight: "standard", fightNote: "Personal coaching; can point you to fights if you want one.",
    tags: ["technical", "private-sessions", "beginner-friendly"],
    style: "Personalized Lamai training for all levels.",
    desc: "A well-regarded Lamai gym known for a personalised approach, suitable for all levels, with fitness and MMA on offer too. Good if you want attention rather than a big crowd.",
  },
  {
    id: "wech-pinyo", name: "Wech Pinyo Muay Thai", city: "koh-samui",
    lat: 9.465, lng: 100.045, rating: 4.8, reviews: 150,
    level: "mixed", fighters: true, accom: true, price: "$$", priceNote: "estimate (placeholder)",
    fight: "standard", fightNote: "Authentic camp; arranges fights for the ready.",
    tags: ["authentic", "technical", "tourist-friendly"],
    style: "Original authentic Lamai Beach camp.",
    desc: "The original, authentic Muay Thai camp on Lamai Beach, run by Thai owner 'Wech'. A genuine, no-gimmicks alternative to the bigger multi-sport gyms.",
  },
  {
    id: "yodyut-samui", name: "Yodyut Muaythai", city: "koh-samui",
    lat: 9.5, lng: 100.06, rating: 4.8, reviews: 180,
    level: "mixed", fighters: true, accom: false, price: "$$", priceNote: "estimate (placeholder)",
    fight: "standard", fightNote: "Traditional camp; books fights for trainees who step up.",
    tags: ["authentic", "technical"],
    style: "Respected traditional Samui gym.",
    desc: "A respected traditional Samui gym with strong technical coaching and a loyal following — authentic island training without the resort gloss.",
  },

  // ============================ KOH PHANGAN ============================
  {
    id: "diamond-muay-thai", name: "Diamond Muay Thai", city: "koh-phangan",
    lat: 9.73, lng: 100.0, rating: 4.7, reviews: 250,
    level: "mixed", fighters: true, accom: true, price: "$$", priceNote: "estimate (placeholder)",
    fight: "standard", fightNote: "Caters to pros and hobbyists; fights for those who train up.",
    tags: ["technical", "authentic", "conditioning"],
    style: "Technical authentic island camp.",
    desc: "An authentic camp (since 2011) with strong technical coaching for everyone from tourists to pro fighters. It caps drop-ins in peak season to keep ratios good — a sign it takes training seriously.",
  },
  {
    id: "phangan-muay-thai", name: "Phangan Muay Thai & Fitness", city: "koh-phangan",
    lat: 9.72, lng: 100.01, rating: 4.6, reviews: 200,
    level: "mixed", fighters: true, accom: false, price: "$$", priceNote: "estimate (placeholder)",
    fight: "standard", fightNote: "The island original; will arrange local fights for the ready.",
    tags: ["tourist-friendly", "conditioning", "beginner-friendly"],
    style: "The island's original gym, all levels.",
    desc: "The first Muay Thai gym on Koh Phangan, running 15+ years, with experienced instructors taking all ages and levels from beginner to pro.",
  },
  {
    id: "horizon-muay-thai", name: "Horizon Muay Thai", city: "koh-phangan",
    lat: 9.7, lng: 100.06, rating: 4.6, reviews: 180,
    level: "mixed", fighters: false, accom: true, price: "$$", priceNote: "estimate (placeholder)",
    fight: "standard", fightNote: "All-levels camp; fights possible but not the focus.",
    tags: ["tourist-friendly", "conditioning", "weight-loss"],
    style: "Scenic all-levels camp.",
    desc: "Overlooking Haad Tien Bay on the east coast, a scenic camp with two daily sessions and qualified instruction for all levels — a fitness-and-fundamentals island base.",
  },
  {
    id: "chinnarach-muay-thai", name: "Chinnarach Muay Thai", city: "koh-phangan",
    lat: 9.74, lng: 100.02, rating: 4.8, reviews: 120,
    level: "mixed", fighters: true, accom: false, price: "$", priceNote: "estimate (placeholder)",
    fight: "standard", fightNote: "Instruction-focused; arranges fights for trainees who step up.",
    tags: ["authentic", "technical", "beginner-friendly"],
    style: "Master Chin's instruction-focused gym.",
    desc: "Run by Master Chin since 2005 with a clear priority on quality instruction. A smaller, authentic island gym for people who want to actually learn the craft.",
  },

  // ============================ KOH TAO ============================
  {
    id: "monsoon-gym-koh-tao", name: "Monsoon Gym & Fight Club", city: "koh-tao",
    lat: 10.1, lng: 99.84, rating: 4.7, reviews: 220,
    level: "mixed", fighters: true, accom: true, price: "$$", priceNote: "dorms available (placeholder)",
    fight: "standard", fightNote: "Combat + fitness camp; arranges fights for the ready.",
    tags: ["tourist-friendly", "conditioning", "weight-loss"],
    style: "Combat + fitness camp with dorms.",
    desc: "Koh Tao's combat-and-fitness hub — Muay Thai, BJJ, HIIT and bootcamps with on-site dorms and kitchen. Great for travellers wanting an active island base, with a path to fighting if you want it.",
  },

  // ============================ KOH LANTA ============================
  {
    id: "lanta-muay-thai-complex", name: "Lanta Muay Thai Complex", city: "koh-lanta",
    lat: 7.63, lng: 99.04, rating: 4.8, reviews: 200,
    level: "mixed", fighters: true, accom: true, price: "$$", priceNote: "visa/long-stay (placeholder)",
    fight: "standard", fightNote: "Has its own stadium; arranges fights for trainees who step up.",
    tags: ["tourist-friendly", "conditioning", "private-sessions"],
    style: "All-in-one training + wellness complex.",
    desc: "An all-in-one Andaman complex near Saladan — Muay Thai plus yoga, ice baths, breathwork, an education-visa program and its own boxing stadium. Training and wellness in one spot.",
  },

  // ============================ KRABI / AO NANG ============================
  {
    id: "khunsuek-muay-thai", name: "Khunsuek Muay Thai", city: "krabi",
    lat: 8.03, lng: 98.82, rating: 4.7, reviews: 130,
    level: "mixed", fighters: true, accom: true, price: "$$", priceNote: "estimate (placeholder)",
    fight: "standard", fightNote: "Beach camp; arranges fights for trainees who step up.",
    tags: ["tourist-friendly", "technical", "conditioning"],
    style: "Ao Nang beach training camp.",
    desc: "A training camp right by Ao Nang Beach offering authentic Thai-style classes for all levels in a holiday setting — a relaxed but real introduction to the Krabi scene.",
  },
  {
    id: "krabi-lion-muay-thai", name: "Krabi Lion Muay Thai", city: "krabi",
    lat: 8.05, lng: 98.9, rating: 4.7, reviews: 110,
    level: "mixed", fighters: true, accom: true, price: "$$", priceNote: "estimate (placeholder)",
    fight: "standard", fightNote: "Will arrange local fights for committed trainees.",
    tags: ["tourist-friendly", "conditioning", "beginner-friendly"],
    style: "Relaxed Krabi camp, all levels.",
    desc: "Set amid Krabi's dramatic scenery, a welcoming camp where a calm setting meets real training — suitable from first-timers to those wanting to push toward a fight.",
  },
  {
    id: "honour-muay-thai", name: "Honour Muay Thai", city: "krabi",
    lat: 8.02, lng: 98.83, rating: 4.8, reviews: 100,
    level: "mixed", fighters: true, accom: false, price: "$", priceNote: "estimate (placeholder)",
    fight: "standard", fightNote: "Traditional Ao Nang gym; books fights for the ready.",
    tags: ["authentic", "technical", "beginner-friendly"],
    style: "Traditional Ao Nang training.",
    desc: "A traditional Ao Nang camp offering authentic Thai-style training for all skill levels — a more grounded, technique-first option in the Krabi area.",
  },

  // ============================ SURAT THANI ============================
  {
    id: "tom-muay-thai-surat", name: "Tom Muay Thai", city: "surat-thani",
    lat: 9.14, lng: 99.33, rating: 4.7, reviews: 80,
    level: "mixed", fighters: true, accom: false, price: "$", priceNote: "estimate (placeholder)",
    fight: "standard", fightNote: "Authentic city gym; arranges local fights for trainees.",
    tags: ["authentic", "technical", "beginner-friendly"],
    style: "Mainland Surat Thani city gym.",
    desc: "An authentic city gym in the mainland gateway to the gulf islands — off the tourist path, genuine local training for anyone passing through Surat Thani.",
  },

  // ============================ CHIANG MAI ============================
  {
    id: "lanna-muay-thai", name: "Lanna Muay Thai (Kiatbusaba)", city: "chiang-mai",
    lat: 18.81, lng: 98.952, rating: 4.7, reviews: 260,
    level: "advanced", fighters: true, accom: false, price: "$", priceNote: "~300 THB/session (placeholder)",
    fight: "quick", fightNote: "Plugged into the local fight scene; matched fast if you can go.",
    tags: ["fighter-focused", "authentic", "technical"],
    style: "Traditional Lanna/Kiatbusaba fighter lineage.",
    desc: "The historic Kiatbusaba camp — a real northern fight lineage that's produced champions. Traditional, fighter-first training; foreigners are welcome but expect the genuine article, not a tourist class.",
    trainers: [{ name: "Kru (placeholder)", note: "Northern lineage" }],
  },
  {
    id: "santai-muay-thai", name: "Santai Muay Thai", city: "chiang-mai",
    lat: 18.742, lng: 99.08, rating: 4.8, reviews: 410,
    level: "mixed", fighters: true, accom: true, price: "$$", priceNote: "~400 THB/session, monthly (placeholder)",
    fight: "standard", fightNote: "Working fight team; fights after a few weeks of training.",
    tags: ["conditioning", "tourist-friendly", "technical"],
    style: "Balanced all-levels training in a rural setting.",
    desc: "A quiet countryside camp east of the city with a working fight team and balanced training. Suits longer stays and all levels — serious enough to fight from, calm enough for beginners.",
  },
  {
    id: "hong-thong-gym", name: "Hong Thong Gym", city: "chiang-mai",
    lat: 18.762, lng: 98.93, rating: 4.7, reviews: 330,
    level: "mixed", fighters: true, accom: true, price: "$", priceNote: "~300 THB/session (placeholder)",
    fight: "standard", fightNote: "Puts trainees on local Chiang Mai cards after some training.",
    tags: ["beginner-friendly", "tourist-friendly", "kids-classes"],
    style: "Accessible training with a route to local fights.",
    desc: "A sociable gym with on-site rooms and a friendly international crowd, but it still puts trainers in local fights. Beginner-friendly, with a real route to competing if you decide you want it.",
  },
  {
    id: "chay-yai-gym", name: "Chay Yai Gym", city: "chiang-mai",
    lat: 18.78, lng: 98.97, rating: 4.6, reviews: 150,
    level: "mixed", fighters: false, accom: false, price: "$$", priceNote: "~400 THB/session (placeholder)",
    fight: "rare", fightNote: "Relaxed gym — not really set up to book you a fight.",
    tags: ["technical", "private-sessions", "beginner-friendly"],
    style: "Small-room, attentive coaching with flexible scheduling.",
    desc: "A small city gym focused on attentive pad work and a relaxed pace. Great for travellers and beginners who want quality rounds — not a competition-focused fighter camp.",
  },
  {
    id: "dang-muay-thai", name: "Dang Muay Thai", city: "chiang-mai",
    lat: 18.755, lng: 98.95, rating: 4.9, reviews: 3500,
    level: "mixed", fighters: true, accom: true, price: "$$", priceNote: "training+stay packages (placeholder)",
    fight: "standard", fightNote: "Can arrange fights, though the crowd is mostly tourists.",
    tags: ["tourist-friendly", "beginner-friendly", "conditioning"],
    style: "High-volume, highly-rated training with accommodation.",
    desc: "One of the highest-rated camps in the country and very beginner-friendly, with 16 trainers, big group classes and accommodation. Volume and accessibility over hardcore fighter culture — ideal for first-timers and longer stays.",
  },
  {
    id: "manop-gym", name: "Manop Gym", city: "chiang-mai",
    lat: 18.785, lng: 98.985, rating: 4.7, reviews: 140,
    level: "advanced", fighters: true, accom: false, price: "$", priceNote: "estimate (placeholder)",
    fight: "quick", fightNote: "Serious fight gym; capable trainees matched quickly.",
    tags: ["fighter-focused", "authentic", "clinch"],
    style: "Hard traditional training for aspiring fighters.",
    desc: "A serious fighter's gym away from the tourist scene, with hard traditional training. Resident fighters and real expectations — come here to compete, not to tick off a holiday class.",
  },
  {
    id: "the-bear-fight-club", name: "The Bear Fight Club", city: "chiang-mai",
    lat: 18.79, lng: 98.99, rating: 4.8, reviews: 260,
    level: "mixed", fighters: false, accom: false, price: "$$", priceNote: "estimate (placeholder)",
    fight: "rare", fightNote: "Social gym — fighting isn't the focus.",
    tags: ["beginner-friendly", "tourist-friendly", "conditioning"],
    style: "Social, community-driven training for all levels.",
    desc: "A social, community-driven gym popular with digital nomads. Welcoming and fun for beginners; lighter on the hardcore fighter side, so it's about consistent training and good people rather than fight prep.",
  },
  {
    id: "the-camp-muay-thai", name: "The Camp Muay Thai Resort & Academy", city: "chiang-mai",
    lat: 18.73, lng: 98.92, rating: 4.8, reviews: 310,
    level: "beginner", fighters: false, accom: true, price: "$$", priceNote: "resort packages (placeholder)",
    fight: "rare", fightNote: "Beginner/female-friendly — fights aren't the main offering.",
    tags: ["beginner-friendly", "tourist-friendly", "kids-classes"],
    style: "Female-friendly resort academy, beginner-welcoming.",
    desc: "A women-run resort academy southwest of the city — one of the most genuinely female- and beginner-friendly camps around, with accommodation. Built for learning and comfort rather than fight-team intensity.",
  },

  // ============================ CHIANG RAI ============================
  {
    id: "mbt-muay-thai-chiang-rai", name: "MBT Muay Thai", city: "chiang-rai",
    lat: 19.91, lng: 99.84, rating: 4.7, reviews: 90,
    level: "mixed", fighters: false, accom: false, price: "$", priceNote: "estimate (placeholder)",
    fight: "rare", fightNote: "Beginner-friendly northern gym; fights aren't the focus.",
    tags: ["beginner-friendly", "tourist-friendly", "technical"],
    style: "Relaxed northern beginner-friendly gym.",
    desc: "A relaxed, beginner-friendly gym in the serene far north — a calm place to learn the fundamentals well away from the crowds of bigger destinations.",
  },
  {
    id: "tonkhar-muay-thai", name: "Tonkhar Muay Thai", city: "chiang-rai",
    lat: 19.92, lng: 99.83, rating: 4.7, reviews: 80,
    level: "mixed", fighters: true, accom: false, price: "$", priceNote: "estimate (placeholder)",
    fight: "standard", fightNote: "Authentic northern gym; arranges local fights for the ready.",
    tags: ["authentic", "technical", "conditioning"],
    style: "Authentic Chiang Rai training.",
    desc: "An authentic Chiang Rai gym with solid technical coaching — a genuine northern option for those exploring the scene beyond Chiang Mai.",
  },

  // ===================================================================
  // NEWLY ADDED — destination gyms (verified:false, coordsVerified:false)
  // Coordinates are AREA-accurate (correct neighbourhood, not the exact
  // door). Ratings/reviews are placeholders until the Google pipeline
  // (M5) fills real numbers by place_id. Review each before launch.
  // ===================================================================

  // ---- Bangkok ----
  {
    id: "sitsongpeenong-bangkok", name: "Sitsongpeenong Bangkok", city: "bangkok",
    lat: 13.69, lng: 100.54, rating: 4.7, reviews: 110,
    level: "advanced", fighters: true, accom: true, price: "$$", priceNote: "estimate (placeholder)",
    fight: "quick", fightNote: "Active stadium-fighter stable; capable trainees are matched quickly.",
    tags: ["fighter-focused", "clinch", "authentic"],
    style: "Authentic stadium-fighter stable with strong clinch.",
    desc: "The Bangkok home of a respected fighter stable, built around clinch and high-level sparring with active stadium fighters in the room. Set up for serious trainees rather than casual drop-ins.",
    verified: false, coordsVerified: false,
  },
  {
    id: "yokkao-training-center", name: "Yokkao Training Center", city: "bangkok",
    lat: 13.70, lng: 100.61, rating: 4.6, reviews: 90,
    level: "mixed", fighters: true, accom: false, price: "$$", priceNote: "estimate (placeholder)",
    fight: "standard", fightNote: "Trainers can arrange local fights for committed students.",
    tags: ["technical", "tourist-friendly", "private-sessions"],
    style: "Technical Muay Thai from a well-known fight brand.",
    desc: "A drop-in-friendly Bangkok gym run by the Yokkao brand, with experienced trainers and a steady flow of visitors. Good for technical sessions and training alongside name fighters.",
    verified: false, coordsVerified: false,
  },
  {
    id: "sityodtong-bangkok", name: "Sityodtong Bangkok", city: "bangkok",
    lat: 13.73, lng: 100.49, rating: 4.6, reviews: 70,
    level: "mixed", fighters: true, accom: false, price: "$$", priceNote: "estimate (placeholder)",
    fight: "standard", fightNote: "Historic camp; will put ready students on local cards.",
    tags: ["authentic", "technical", "fighter-focused"],
    style: "One of Muay Thai's historic lineages.",
    desc: "The Bangkok branch of one of Muay Thai's oldest and most storied camps. Traditional coaching with a long competitive pedigree, suitable across levels.",
    verified: false, coordsVerified: false,
  },
  {
    id: "eminent-air", name: "Eminent Air Boxing Gym", city: "bangkok",
    lat: 13.83, lng: 100.60, rating: 4.5, reviews: 60,
    level: "mixed", fighters: true, accom: false, price: "$$", priceNote: "estimate (placeholder)",
    fight: "standard", fightNote: "Old-school camp that matches keen students locally.",
    tags: ["authentic", "fighter-focused", "conditioning"],
    style: "Old-school Bangkok fight camp.",
    desc: "A long-running, no-frills Bangkok camp with a real fighter pedigree. Traditional training and conditioning away from the tourist circuit.",
    verified: false, coordsVerified: false,
  },
  {
    id: "elite-fight-club-bangkok", name: "Elite Fight Club Bangkok", city: "bangkok",
    lat: 13.74, lng: 100.58, rating: 4.6, reviews: 130,
    level: "mixed", fighters: false, accom: false, price: "$$$", priceNote: "premium (placeholder)",
    fight: "selective", fightNote: "Premium city gym focused on training quality more than booking fights.",
    tags: ["technical", "tourist-friendly", "private-sessions"],
    style: "Premium boutique training in the city centre.",
    desc: "A polished, premium gym in central Bangkok aimed at professionals and travellers who want quality coaching in a modern space. More technique-and-fitness focused than a hard fight camp.",
    verified: false, coordsVerified: false,
  },
  {
    id: "rsm-academy", name: "RSM Muay Thai Academy", city: "bangkok",
    lat: 13.738, lng: 100.560, rating: 4.6, reviews: 85,
    level: "mixed", fighters: false, accom: false, price: "$$", priceNote: "estimate (placeholder)",
    fight: "standard", fightNote: "Central gym; can arrange fights for committed trainees.",
    tags: ["beginner-friendly", "tourist-friendly", "technical"],
    style: "Convenient central-Bangkok Muay Thai.",
    desc: "A conveniently located academy near Asok with a mixed crowd of locals and travellers. Easy to reach and welcoming to beginners while still serious about technique.",
    verified: false, coordsVerified: false,
  },
  {
    id: "sor-thanikul", name: "Sor Thanikul Gym", city: "bangkok",
    lat: 13.77, lng: 100.52, rating: 4.8, reviews: 75,
    level: "advanced", fighters: true, accom: false, price: "$", priceNote: "estimate (placeholder)",
    fight: "quick", fightNote: "Legendary fight camp; capable trainees put on stadium cards quickly.",
    tags: ["fighter-focused", "technical", "authentic"],
    style: "Femeu precision — ring intelligence over raw power.",
    desc: "Home of Namsaknoi Yudthagarngamtorn, widely regarded as one of the most complete and untouchable fighters in Muay Thai history. The camp embodies the clever femeu style — footwork, timing, economy of movement. Hard to find, not set up for tourists, and not interested in your holiday — this is for fighters.",
    verified: false, coordsVerified: false,
  },
  {
    id: "jocky-gym", name: "Jocky Gym", city: "bangkok",
    lat: 13.76, lng: 100.51, rating: 4.7, reviews: 65,
    level: "advanced", fighters: true, accom: false, price: "$", priceNote: "estimate (placeholder)",
    fight: "quick", fightNote: "Old-school fight camp; capable trainees put on Lumpinee/Rajadamnern cards.",
    tags: ["fighter-focused", "authentic", "conditioning"],
    style: "Golden-era Bangkok fighter development.",
    desc: "A golden-era Bangkok fight camp that has produced champions across decades of Thai boxing. Hard conditioning, heavy bag work and real sparring with active stadium fighters. No frills, no tourists — a functioning fight stable in the old Bangkok tradition.",
    verified: false, coordsVerified: false,
  },
  {
    id: "por-muangphet", name: "Por Muangphet Muay Thai", city: "bangkok",
    lat: 13.745, lng: 100.535, rating: 4.7, reviews: 70,
    level: "advanced", fighters: true, accom: false, price: "$", priceNote: "estimate (placeholder)",
    fight: "quick", fightNote: "Active fight stable with a direct pipeline to the big stadiums.",
    tags: ["fighter-focused", "authentic", "clinch"],
    style: "Powerful, aggressive Isaan-influenced stadium training.",
    desc: "A well-regarded Bangkok fight stable with strong Isaan roots and active fighters on stadium cards. The style is powerful and aggressive — heavy clinch, relentless conditioning, high-output sparring. Serious trainees are welcomed; it's a working fight camp with a real pedigree.",
    verified: false, coordsVerified: false,
  },

  // ---- Phuket ----
  {
    id: "bangtao-muay-thai-mma", name: "Bangtao Muay Thai & MMA", city: "phuket",
    lat: 7.995, lng: 98.295, rating: 4.7, reviews: 150,
    level: "mixed", fighters: true, accom: true, price: "$$", priceNote: "estimate (placeholder)",
    fight: "standard", fightNote: "Active fight team; ready students get matched on local cards.",
    tags: ["technical", "tourist-friendly", "fighter-focused"],
    style: "Modern Muay Thai with MMA and BJJ crossover.",
    desc: "A modern Cherng Talay (Bang Tao) camp combining Muay Thai with MMA and BJJ under experienced coaches. Caters to all levels, from first-timers to its competitive fight team.",
    verified: false, coordsVerified: false,
  },
  {
    id: "rawai-muay-thai", name: "Rawai Muay Thai", city: "phuket",
    lat: 7.778, lng: 98.325, rating: 4.6, reviews: 200,
    level: "mixed", fighters: true, accom: true, price: "$$", priceNote: "estimate (placeholder)",
    fight: "standard", fightNote: "Long-stay fighter gym; arranges fights for those who put in the work.",
    tags: ["fighter-focused", "authentic", "conditioning"],
    style: "Long-stay, fighter-oriented training.",
    desc: "An established Rawai gym geared to long-stay trainees and aspiring fighters, with on-site accommodation. Training is serious but accessible to motivated beginners.",
    verified: false, coordsVerified: false,
  },
  {
    id: "sitsongpeenong-phuket", name: "Sitsongpeenong Phuket", city: "phuket",
    lat: 7.785, lng: 98.323, rating: 4.7, reviews: 120,
    level: "advanced", fighters: true, accom: true, price: "$$", priceNote: "estimate (placeholder)",
    fight: "quick", fightNote: "Authentic fighter stable; capable trainees matched quickly.",
    tags: ["fighter-focused", "clinch", "authentic"],
    style: "Authentic fighter stable with strong clinch.",
    desc: "The Phuket camp of a respected fighter stable, focused on authentic training and strong clinch work with active fighters. Best suited to those who already train.",
    verified: false, coordsVerified: false,
  },
  {
    id: "phuket-fight-club", name: "Phuket Fight Club", city: "phuket",
    lat: 7.83, lng: 98.34, rating: 4.6, reviews: 70,
    level: "advanced", fighters: true, accom: false, price: "$$", priceNote: "estimate (placeholder)",
    fight: "quick", fightNote: "Competition-focused gym that actively develops and books fighters.",
    tags: ["fighter-focused", "conditioning", "technical"],
    style: "Competition-focused fighter development.",
    desc: "A competition-oriented Chalong-area gym that produces and corners fighters. Hard, focused training for those chasing real fights rather than fitness classes.",
    verified: false, coordsVerified: false,
  },
  {
    id: "phuket-top-team", name: "Phuket Top Team", city: "phuket",
    lat: 7.832, lng: 98.337, rating: 4.7, reviews: 180,
    level: "mixed", fighters: true, accom: true, price: "$$", priceNote: "estimate (placeholder)",
    fight: "standard", fightNote: "MMA-leaning camp; Muay Thai fights can be arranged for the ready.",
    tags: ["technical", "tourist-friendly", "conditioning"],
    style: "MMA-leaning camp with strong Muay Thai.",
    desc: "A large Chalong camp best known for MMA but with a strong Muay Thai program and on-site facilities. Suits all levels and cross-training travellers.",
    verified: false, coordsVerified: false,
  },

  // ---- Krabi ----
  {
    id: "emerald-muay-thai", name: "Emerald Muay Thai", city: "krabi",
    lat: 8.03, lng: 98.83, rating: 4.6, reviews: 60,
    level: "mixed", fighters: false, accom: false, price: "$$", priceNote: "estimate (placeholder)",
    fight: "standard", fightNote: "Welcoming gym; can arrange local fights for committed students.",
    tags: ["beginner-friendly", "tourist-friendly", "technical"],
    style: "All-levels training in Krabi.",
    desc: "A welcoming all-levels gym in the Krabi area with patient coaching for travellers and beginners, plus a path to local fights for those who stay and train.",
    verified: false, coordsVerified: false,
  },

  // ---- Hua Hin ----
  {
    id: "sitjaopho", name: "Sitjaopho Muay Thai", city: "hua-hin",
    lat: 12.57, lng: 99.96, rating: 4.9, reviews: 90,
    level: "mixed", fighters: true, accom: true, price: "$$", priceNote: "estimate (placeholder)",
    fight: "selective", fightNote: "Quality over volume — fights arranged for trainees who earn the coaches' confidence.",
    tags: ["technical", "authentic", "fighter-focused"],
    style: "Muay Femeu — maximum damage with minimum movement.",
    desc: "A highly regarded gym run by twin brothers Kru F and Kru O, known for the intelligent femeu style — precise timing, clean angles and ring control over raw aggression. Small group sizes mean real pad time and genuine coaching. One of the best technique gyms in Thailand outside Bangkok.",
    trainers: [{ name: "Kru F" }, { name: "Kru O", note: "Femeu specialists" }],
    verified: false, coordsVerified: false,
  },

  // ---- Chiang Mai legendary camps ----
  {
    id: "sitmonchai", name: "Sitmonchai Muay Thai", city: "chiang-mai",
    lat: 18.795, lng: 98.975, rating: 4.9, reviews: 130,
    level: "advanced", fighters: true, accom: true, price: "$", priceNote: "estimate (placeholder)",
    fight: "quick", fightNote: "One of Thailand's most historic camps; capable trainees matched on northern and Bangkok cards.",
    tags: ["fighter-focused", "authentic", "technical", "conditioning"],
    style: "Classic Thai champion training — brutal conditioning, high-level sparring.",
    desc: "One of the most legendary camps in Thailand, with decades of champions and a reputation that draws serious fighters from around the world. Hard, traditional training — heavy conditioning, relentless pad work, real sparring. Not a tourist gym; best for those who already train and want the genuine northern fight camp experience.",
    verified: false, coordsVerified: false,
  },
  {
    id: "kiatphontip", name: "Kiatphontip Muay Thai", city: "chiang-mai",
    lat: 18.802, lng: 98.962, rating: 4.7, reviews: 90,
    level: "mixed", fighters: true, accom: false, price: "$", priceNote: "estimate (placeholder)",
    fight: "standard", fightNote: "Championship lineage camp; puts ready trainees on northern cards.",
    tags: ["fighter-focused", "technical", "authentic"],
    style: "Northern champion lineage — sharp technique and ring craft.",
    desc: "A respected northern camp with a long championship lineage and a focus on precise, sharp Muay Thai. Traditional training with active fighters on the roster and a direct route to competing on the northern circuit for those who put the work in.",
    verified: false, coordsVerified: false,
  },

  // ---- Pattaya ----
  {
    id: "combat-club-pattaya", name: "WKO Combat Club Pattaya", city: "pattaya",
    lat: 12.92, lng: 100.88, rating: 4.6, reviews: 70,
    level: "mixed", fighters: true, accom: false, price: "$$", priceNote: "estimate (placeholder)",
    fight: "standard", fightNote: "Fighter-oriented gym; arranges local fights for the ready.",
    tags: ["fighter-focused", "conditioning", "technical"],
    style: "Fighter-oriented Pattaya training.",
    desc: "A fighter-oriented Pattaya gym with a focused, no-frills atmosphere and regular local fight opportunities for committed trainees.",
    verified: false, coordsVerified: false,
  },
];

// ---------------------------------------------------------------------------
// Builders — derive the three exports the data layer expects from the specs.
// ---------------------------------------------------------------------------

const cityName = (slug: string) =>
  CITIES.find((c) => c.slug === slug)?.name ?? slug;

const placeId = (id: string) => `SEED_${id.replace(/-/g, "_")}`;

function toEditorial(s: Spec): GymEditorial {
  return {
    id: s.id,
    place_id: placeId(s.id),
    name: s.name,
    citySlug: s.city,
    slug: s.id,
    description: s.desc,
    known_for: s.tags,
    style: s.style,
    trainers: s.trainers ?? [{ name: "Gym coaching team" }],
    price_range: s.price,
    price_note: s.priceNote,
    has_accommodation: s.accom,
    experience_level: s.level,
    has_fighters: s.fighters,
    verified: s.verified ?? true,
    stadiums: s.stadiums,
    instagram: s.instagram,
    line_id: s.line_id,
  };
}

function toGoogle(s: Spec): GymGoogle {
  return {
    place_id: placeId(s.id),
    lat: s.lat,
    lng: s.lng,
    google_rating: s.rating,
    google_review_count: s.reviews,
    photos: [],
    google_maps_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${s.name} ${cityName(s.city)} Thailand`,
    )}`,
    last_synced: "seed",
  };
}

export const GYMS_EDITORIAL: GymEditorial[] = SPECS.map(toEditorial);

export const GYMS_GOOGLE_SEED: Record<string, GymGoogle> = Object.fromEntries(
  SPECS.map((s) => [s.id, toGoogle(s)]),
);

export const FIGHT_ACCESS: Record<string, { access: FightAccess; note: string }> =
  Object.fromEntries(SPECS.map((s) => [s.id, { access: s.fight, note: s.fightNote }]));
