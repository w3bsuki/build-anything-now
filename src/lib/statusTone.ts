import type { AnimalStatus } from "@/types";

export type StatusTone = {
  badgeSolid: string;
  badgeSoft: string;
  progress: string;
  cta: string;
  dot: string;
};

const STATUS_TONES: Record<AnimalStatus, StatusTone> = {
  critical: {
    badgeSolid: "border-destructive/70 bg-destructive text-destructive-foreground",
    badgeSoft: "border-destructive/35 bg-destructive/10 text-destructive",
    progress: "bg-destructive",
    cta: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    dot: "bg-destructive-foreground/90",
  },
  urgent: {
    badgeSolid: "border-urgent/70 bg-urgent text-urgent-foreground",
    badgeSoft: "border-urgent/35 bg-urgent/20 text-urgent-foreground",
    progress: "bg-urgent",
    cta: "bg-urgent text-urgent-foreground hover:bg-urgent/90",
    dot: "bg-urgent-foreground/90",
  },
  recovering: {
    badgeSolid: "border-recovering/70 bg-recovering text-recovering-foreground",
    badgeSoft: "border-recovering/35 bg-recovering/10 text-recovering",
    progress: "bg-recovering",
    cta: "bg-primary text-primary-foreground hover:bg-primary/90",
    dot: "bg-recovering-foreground/90",
  },
  adopted: {
    badgeSolid: "border-adopted/70 bg-adopted text-adopted-foreground",
    badgeSoft: "border-adopted/35 bg-adopted/10 text-adopted",
    progress: "bg-adopted",
    cta: "bg-success text-success-foreground hover:bg-success/90",
    dot: "bg-adopted-foreground/90",
  },
};

export function getStatusTone(status: AnimalStatus): StatusTone {
  return STATUS_TONES[status];
}
