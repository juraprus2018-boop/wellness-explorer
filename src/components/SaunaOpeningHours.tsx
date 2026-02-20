import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SaunaOpeningHoursProps {
  openingHours: string[] | null;
}

const DAY_MAP: Record<string, number> = {
  maandag: 1, dinsdag: 2, woensdag: 3, donderdag: 4,
  vrijdag: 5, zaterdag: 6, zondag: 0,
  monday: 1, tuesday: 2, wednesday: 3, thursday: 4,
  friday: 5, saturday: 6, sunday: 0,
};

function isOpenNow(hours: string[]): { isOpen: boolean; todayLine: string | null } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const currentTime = now.getHours() * 100 + now.getMinutes();

  for (const line of hours) {
    const lower = line.toLowerCase();
    const matchedDay = Object.entries(DAY_MAP).find(([name]) => lower.startsWith(name));
    if (!matchedDay) continue;
    if (matchedDay[1] !== dayOfWeek) continue;

    // Try to extract time range like "09:00 – 22:00" or "9:00-22:00"
    const timeMatch = line.match(/(\d{1,2})[:.:](\d{2})\s*[–\-—]\s*(\d{1,2})[:.:](\d{2})/);
    if (timeMatch) {
      const openTime = parseInt(timeMatch[1]) * 100 + parseInt(timeMatch[2]);
      const closeTime = parseInt(timeMatch[3]) * 100 + parseInt(timeMatch[4]);
      return {
        isOpen: currentTime >= openTime && currentTime < closeTime,
        todayLine: line,
      };
    }

    // If line contains "gesloten" or "closed"
    if (lower.includes("gesloten") || lower.includes("closed")) {
      return { isOpen: false, todayLine: line };
    }

    return { isOpen: false, todayLine: line };
  }

  return { isOpen: false, todayLine: null };
}

const SaunaOpeningHours = ({ openingHours }: SaunaOpeningHoursProps) => {
  if (!openingHours || openingHours.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>Openingstijden niet beschikbaar</span>
      </div>
    );
  }

  const { isOpen, todayLine } = isOpenNow(openingHours);
  const dayNames = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];
  const todayIndex = new Date().getDay();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary" />
        <span className="font-medium">Openingstijden</span>
        <Badge variant={isOpen ? "default" : "secondary"} className={isOpen ? "bg-green-600 text-white hover:bg-green-700" : ""}>
          {isOpen ? "Nu geopend" : "Gesloten"}
        </Badge>
      </div>
      <div className="grid gap-1 text-sm">
        {openingHours.map((line, i) => {
          const lower = line.toLowerCase();
          const isToday = Object.entries(DAY_MAP).some(
            ([name, day]) => lower.startsWith(name) && day === todayIndex
          );
          return (
            <div
              key={i}
              className={`flex items-center rounded px-2 py-1 ${isToday ? "bg-primary/10 font-medium" : ""}`}
            >
              <span className="text-muted-foreground">{line}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SaunaOpeningHours;
