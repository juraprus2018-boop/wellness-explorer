import { useEffect, useRef, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

const createCustomIcon = (color = "hsl(174, 60%, 40%)") => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="32" height="42">
    <defs>
      <filter id="shadow" x="-20%" y="-10%" width="140%" height="130%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.25"/>
      </filter>
    </defs>
    <path d="M16 0C7.16 0 0 7.16 0 16c0 10.97 14.34 24.32 14.97 24.88a1.5 1.5 0 0 0 2.06 0C17.66 40.32 32 26.97 32 16 32 7.16 24.84 0 16 0z" fill="${color}" filter="url(#shadow)"/>
    <circle cx="16" cy="15" r="7" fill="white" opacity="0.9"/>
    <circle cx="16" cy="15" r="4" fill="${color}"/>
  </svg>`;

  return L.divIcon({
    html: svg,
    className: "custom-marker",
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
  });
};

const markerIcon = createCustomIcon();

const SaunaMap = ({ saunas, height = "400px", className = "" }: SaunaMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!containerRef.current || mappable.length === 0) return;

    // Clean up existing map
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(containerRef.current).setView(center, zoom);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mappable.forEach((sauna) => {
      const ratingHtml =
        sauna.average_rating != null && Number(sauna.average_rating) > 0
          ? `<p class="text-xs mb-2">⭐ ${Number(sauna.average_rating).toFixed(1)} (${sauna.review_count} reviews)</p>`
          : "";

      const popupContent = `
        <div style="min-width:180px">
          <p style="font-weight:600;font-size:14px;margin:0 0 4px">${sauna.name}</p>
          <p style="font-size:12px;color:#666;margin:0 0 4px">${sauna.plaatsnaam}</p>
          ${ratingHtml}
          <a href="/saunas/${sauna.provincie_slug}/${sauna.plaatsnaam_slug}/${sauna.slug}" style="font-size:12px;color:hsl(174,60%,40%)">Bekijk details →</a>
        </div>
      `;

      L.marker([sauna.lat!, sauna.lng!], { icon: markerIcon })
        .addTo(map)
        .bindPopup(popupContent);
    });

    // Force a resize after mount
    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [mappable, center, zoom]);

  if (mappable.length === 0) return null;

  return (
    <div
      className={`overflow-hidden rounded-lg border border-border relative z-0 ${className}`}
      style={{ height }}
    >
      <div ref={containerRef} style={{ height: "100%", width: "100%", zIndex: 0 }} />
    </div>
  );
};

export default SaunaMap;
