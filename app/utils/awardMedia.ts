import { withBase } from "~/utils/withBase";

const awardMedia: Record<string, string> = {
  "https://iramot.ir/wp-content/uploads/2025/08/170577943-1024x684.jpg":
    "/media/award/170577943-1024x684.webp",
  "https://iramot.ir/wp-content/uploads/2025/08/170577943.jpg":
    "/media/award/170577943.webp",
  "https://iramot.ir/wp-content/uploads/2025/08/170577940.png":
    "/media/award/170577940.webp",
  "https://iramot.ir/wp-content/uploads/2025/08/photo_2025-08-30_11-31-09.jpg":
    "/media/award/photo_2025-08-30_11-31-09.webp",
  "https://iramot.ir/wp-content/uploads/2025/08/photo_2025-08-30_11-30-43-723x1024.jpg":
    "/media/award/photo_2025-08-30_11-30-43.webp",
  "https://iramot.ir/wp-content/uploads/2025/08/image.png": "/media/award/image.webp",
  "https://iramot.ir/wp-content/uploads/2025/08/IRAMIT-Timeline.mp4":
    "/media/award/IRAMIT-Timeline.mp4",
  "https://iramot.ir/wp-content/uploads/2025/08/IRAMIT-Timeline-1.mp4":
    "/media/award/IRAMIT-Timeline.mp4",
  "https://iramot.ir/wp-content/uploads/2025/08/IRAMIT-9th.pdf":
    "/media/award/IRAMIT-9th.pdf",
  "https://iramot.ir/wp-content/uploads/2025/08/IRAMOT-Model-Vrs.-01.pdf":
    "/media/award/IRAMOT-Model-Vrs.-01.pdf",
};

export function mirrorAwardMedia(html: string, baseURL = "/"): string {
  const entries = Object.entries(awardMedia).sort(
    (left, right) => right[0].length - left[0].length,
  );
  let next = html;
  for (const [from, to] of entries) {
    next = next.split(from).join(withBase(baseURL, to));
  }
  return next;
}
