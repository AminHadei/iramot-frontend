import type { ConferenceContent, SiteContent } from "~/types/content";
import { formatConferenceDates } from "~/utils/conferenceDates";
import { withBase } from "~/utils/withBase";

export interface ConferenceBannerView {
  state: "neutral" | "image" | "tint";
  title: string | null;
  dateLine: string | null;
  place: string | null;
  imageUrl: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  isLink: boolean;
}

function filled(value: string | null | undefined): string | null {
  if (!value || value.trim() === "") return null;
  return value;
}

export function conferenceBannerView(
  conference: ConferenceContent | null | undefined,
  baseURL: string,
): ConferenceBannerView {
  const banner = conference?.banner;
  const title = filled(banner?.title);
  const image = filled(banner?.image);
  let state: ConferenceBannerView["state"] = "tint";
  if (!title) state = "neutral";
  else if (image) state = "image";
  const ctaUrl = filled(banner?.ctaUrl);
  const ctaLabel = filled(banner?.ctaLabel);
  return {
    state,
    title,
    dateLine:
      filled(banner?.dateText) ??
      formatConferenceDates(banner?.startDate ?? null, banner?.endDate ?? null),
    place: filled(banner?.place),
    imageUrl: image ? withBase(baseURL, image) : null,
    ctaLabel,
    ctaUrl,
    isLink: state !== "neutral" && Boolean(ctaUrl),
  };
}

export function useConferenceBanner() {
  const siteState = useSite();
  const baseURL = useRuntimeConfig().app.baseURL;
  return computed(() => {
    const site = siteState.data.value as SiteContent | null;
    return conferenceBannerView(site?.conference, baseURL);
  });
}
