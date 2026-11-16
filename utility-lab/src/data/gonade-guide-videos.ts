/** Original source clips. No autoplay, downloads or local clip copies.
 * Five Nuke clips were already verified; additional accepted files must return
 * video/mp4 and decode positive browser duration. */
export const GONADE_GUIDE_VIDEOS: Record<
  string,
  { videoUrl: string; videoStart?: number }
> = {
  "gonade-nuke-a-site-from-t-spawn-flash": {
    videoUrl: "https://gonade.app/videos/3002.mp4",
  },
  "gonade-nuke-vent-drop-from-t-spawn-smoke": {
    videoUrl: "https://gonade.app/videos/3028.mp4",
  },
  "gonade-nuke-top-hut-from-t-spawnroof-molotov": {
    videoUrl: "https://gonade.app/videos/3037.mp4",
  },
  "gonade-nuke-mustang-from-t-roof-molotov": {
    videoUrl: "https://gonade.app/videos/3038.mp4",
  },
  "gonade-nuke-secret-from-t-outside-molotov": {
    videoUrl: "https://gonade.app/videos/3039.mp4",
  },
  "gonade-anubis-t-stairs-from-a-plat-he": {
    videoUrl: "https://gonade.app/videos/1008.mp4",
  },
  "gonade-anubis-mid-doorswindow-from-ruins-molotov": {
    videoUrl: "https://gonade.app/videos/1014.mp4",
  },
  "gonade-anubis-mid-doorswindow-from-t-spawn-smoke": {
    videoUrl: "https://gonade.app/videos/1041.mp4",
  },
  "gonade-inferno-top-mid-from-t-spawn-smoke": {
    videoUrl: "https://gonade.app/videos/7048.mp4",
  },
  "gonade-ancient-lane-from-b-short-he": {
    videoUrl: "https://gonade.app/videos/2046.mp4",
  },
};
