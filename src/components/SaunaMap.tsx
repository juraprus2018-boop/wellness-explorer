import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface SaunaMapItem {
  id: string;
  name: string;
  slug: string;
  plaatsnaam: string;
  plaatsnaam_slug: string;
  provincie_slug: string;
  lat: number | null;
  lng: number | null;
  average_rating: number | null;
  review_count: number | null;
}

interface SaunaMapProps {
  saunas: SaunaMapItem[];
  height?: string;
  className?: string;
}

const SaunaMap = ({ saunas, height = "400px", className = "" }: SaunaMapProps) => {
  const mappable = useMemo(
    () => saunas.filter((s) => s.lat != null && s.lng != null),
    [saunas]
  );

  const center: [number, number] = useMemo(() => {
    if (mappable.length === 0) return [52.2, 5.3];
    const avgLat = mappable.reduce((sum, s) => sum + s.lat!, 0) / mappable.length;
    const avgLng = mappable.reduce((sum, s) => sum + s.lng!, 0) / mappable.length;
    return [avgLat, avgLng];
  }, [mappable]);

  const zoom = useMemo(() => {
    if (mappable.length <= 1) return 12;
    if (mappable.length <= 5) return 10;
    return 9;
  }, [mappable]);

  if (mappable.length === 0) return null;

  return (
    <div className={`overflow-hidden rounded-lg border border-border ${className}`} style={{ height }}>
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mappable.map((sauna) => (
          <Marker key={sauna.id} position={[sauna.lat!, sauna.lng!]}>
            <Popup>
              <div className="min-w-[180px]">
                <p className="font-semibold text-sm mb-1">{sauna.name}</p>
                <p className="text-xs text-muted-foreground mb-1">{sauna.plaatsnaam}</p>
                {sauna.average_rating && Number(sauna.average_rating) > 0 && (
                  <p className="text-xs mb-2">⭐ {Number(sauna.average_rating).toFixed(1)} ({sauna.review_count} reviews)</p>
                )}
                <a
                  href={`/sauna/${sauna.provincie_slug}/${sauna.plaatsnaam_slug}/${sauna.slug}`}
                  className="text-xs text-primary hover:underline"
                >
                  Bekijk details →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default SaunaMap;
