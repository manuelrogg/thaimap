import type { Bounds, City, LatLng, Region } from "@/lib/types";

// Cities are real; centers are real-world coordinates. Bounds are a simple box
// around the centre, sized to comfortably contain that city's gyms for the
// zoom-to-city view. `gym_count` is derived by the loader (lib/data.ts).

type CitySeed = Omit<City, "gym_count">;

/** Square-ish bounds box around a centre (degrees). Smaller `d` for islands. */
function box(center: LatLng, d = 0.12): Bounds {
  return {
    north: center.lat + d,
    south: center.lat - d,
    east: center.lng + d,
    west: center.lng - d,
  };
}

// Major hubs shown on the zoomed-out overview map (spread out, no overlap).
// Every other city only appears once its region chip is selected.
const MAJOR = new Set([
  "bangkok",
  "pattaya",
  "hua-hin",
  "khon-kaen",
  "chiang-mai",
  "phuket",
  "koh-samui",
  "krabi",
]);

function city(
  slug: string,
  name: string,
  region: Region,
  lat: number,
  lng: number,
  blurb: string,
  d = 0.12,
): CitySeed {
  const center = { lat, lng };
  return {
    slug,
    name,
    region,
    center,
    bounds: box(center, d),
    blurb,
    major: MAJOR.has(slug),
  };
}

export const CITIES: CitySeed[] = [
  // ---- Bangkok ----
  city(
    "bangkok",
    "Bangkok",
    "Central",
    13.7563,
    100.5018,
    "The capital is home to the legendary Lumpinee and Rajadamnern stadiums and a deep bench of hard-nosed fighter gyms alongside tourist-friendly camps in the old town.",
    0.2,
  ),

  // ---- Central ----
  city(
    "pattaya",
    "Pattaya",
    "East Coast",
    12.9236,
    100.8825,
    "A massive fight scene on the eastern seaboard — historic camps like Fairtex and Sityodtong alongside dozens of foreigner-friendly gyms.",
    0.1,
  ),
  city(
    "hua-hin",
    "Hua Hin",
    "West",
    12.5684,
    99.9577,
    "A growing royal-resort town scene mixing authentic Thai gyms with polished training resorts a few hours from Bangkok.",
    0.1,
  ),

  // ---- Isaan (northeast) — the fighter heartland ----
  city(
    "korat",
    "Korat (Nakhon Ratchasima)",
    "Isaan",
    14.9799,
    102.0978,
    "The gateway to Isaan and home to serious countryside camps — the start of Thailand's fighter heartland.",
  ),
  city(
    "buriram",
    "Buriram",
    "Isaan",
    14.993,
    103.1029,
    "Deep in the Isaan heartland, with a proud fight history and stables that have fed champions to the big Bangkok gyms.",
  ),
  city(
    "khon-kaen",
    "Khon Kaen",
    "Isaan",
    16.4419,
    102.836,
    "A major Isaan hub where kids grow up fighting — authentic, affordable training away from the tourist trail.",
  ),
  city(
    "udon-thani",
    "Udon Thani",
    "Isaan",
    17.4138,
    102.787,
    "A strong northern-Isaan scene known for licensed, champion-led camps and some of the best training value in Thailand.",
  ),
  city(
    "ubon-ratchathani",
    "Ubon Ratchathani",
    "Isaan",
    15.244,
    104.847,
    "Eastern Isaan, a cradle of Muay Thai with grassroots gyms and rising stadium stars.",
  ),

  // ---- North ----
  city(
    "chiang-mai",
    "Chiang Mai",
    "North",
    18.7883,
    98.9853,
    "The relaxed northern capital pairs a strong fighter tradition (Lanna/Kiatbusaba lineage) with laid-back camps in the surrounding countryside.",
    0.13,
  ),
  city(
    "chiang-rai",
    "Chiang Rai",
    "North",
    19.9105,
    99.8406,
    "The far-northern scene — serene, beginner-friendly camps in the mountains beyond Chiang Mai.",
  ),

  // ---- South & Islands ----
  city(
    "phuket",
    "Phuket",
    "South & Islands",
    7.9519,
    98.3381,
    "The island has become the world's Muay Thai training-holiday hub — large international camps around Chalong and Rawai, plus boutique gyms in the hills.",
    0.22,
  ),
  city(
    "koh-samui",
    "Koh Samui",
    "South & Islands",
    9.512,
    100.0136,
    "One of Thailand's biggest island Muay Thai destinations — dozens of gyms clustered around Lamai, from WMC camps to multi-sport resorts.",
    0.09,
  ),
  city(
    "koh-phangan",
    "Koh Phangan",
    "South & Islands",
    9.7319,
    100.0136,
    "Better known for parties, but a genuine and growing Muay Thai scene with authentic camps across the island.",
    0.06,
  ),
  city(
    "koh-tao",
    "Koh Tao",
    "South & Islands",
    10.0956,
    99.8405,
    "A tiny dive island with a surprisingly solid combat-and-fitness scene for travellers.",
    0.05,
  ),
  city(
    "krabi",
    "Krabi / Ao Nang",
    "South & Islands",
    8.0863,
    98.9063,
    "Dramatic Andaman scenery around Ao Nang with several welcoming, traditional Thai camps.",
  ),
  city(
    "koh-lanta",
    "Koh Lanta",
    "South & Islands",
    7.6167,
    99.05,
    "A laid-back Andaman island with all-in-one training-and-wellness camps.",
    0.1,
  ),
  city(
    "surat-thani",
    "Surat Thani",
    "South & Islands",
    9.1382,
    99.3215,
    "The mainland gateway to the gulf islands, with authentic city gyms off the tourist path.",
  ),
];
