import AdSenseZone from '../AdSenseZone';

export default function AdSenseZoneExample() {
  return (
    <div className="space-y-4 p-4">
      <AdSenseZone slot="header-leaderboard" format="horizontal" />
      <AdSenseZone slot="sidebar-rectangle" format="rectangle" />
      <AdSenseZone slot="sidebar-skyscraper" format="vertical" />
    </div>
  );
}
