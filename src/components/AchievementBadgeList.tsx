import { Award, BadgeCheck, Crown, Handshake, Mic2, ShieldCheck } from "lucide-react";
import { StatusPill } from "@/components/ui";
import type { AchievementBadge, AchievementKey } from "@/lib/achievements";

const achievementIcons: Record<AchievementKey, typeof BadgeCheck> = {
  attendance: BadgeCheck,
  speaker: Mic2,
  contributor: Handshake,
  organizer: Crown,
  early_supporter: Award,
  testnet_sbt_minted: ShieldCheck
};

export function AchievementBadgeList({ badges }: { badges: AchievementBadge[] }) {
  if (badges.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => {
        const Icon = achievementIcons[badge.key];

        return (
          <StatusPill key={badge.key} tone={badge.tone}>
            <span className="inline-flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5" />
              {badge.label}
            </span>
          </StatusPill>
        );
      })}
    </div>
  );
}
