import { getCities, getGymMapData, getRegionGymCounts } from "@/lib/data";
import { MapExplorer } from "@/components/MapExplorer";

// Home — the map IS the page. A 3-level explorer: Region → City → Gym. The
// MapExplorer (client) owns the zoom level and keeps the sidebar/breadcrumb in
// sync. Data is seed-based and cost-free (no live Google fetch on the overview).

export default function Home() {
  const cities = getCities();
  const gyms = getGymMapData();
  const regionCounts = getRegionGymCounts();
  return <MapExplorer cities={cities} gyms={gyms} regionCounts={regionCounts} />;
}
