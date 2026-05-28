type YTPlayerState = {
  ENDED: number;
  PLAYING: number;
};

type YTEvent = {
  data: number;
};

type YTPlayer = {
  playVideo: () => void;
  stopVideo: () => void;
  loadVideoById: (
    videoId:
      | string
      | {
          videoId: string;
          startSeconds?: number;
        },
  ) => void;
};

type YTNamespace = {
  Player: new (
    elementId: string,
    options: {
      width: string;
      height: string;
      videoId: string;
      playerVars: Record<string, number>;
      events: {
        onReady?: () => void;
        onError?: (event: YTEvent) => void;
        onStateChange?: (event: YTEvent) => void;
      };
    },
  ) => YTPlayer;
  PlayerState: YTPlayerState;
};

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const RUN_MUSIC_ID = "OAue7K7hAto";
const RUN_FALLBACK_ID = "8XThWIO_NEE";
const FAIL_MUSIC_START_SECONDS = 0.6;
const WIN_MUSIC_IDS = ["K1Y4wq_FPP4", "barWV7RWkq0"] as const;

export class GameAudio {
  private apiReadyPromise: Promise<void> | null = null;
  private playersReadyPromise: Promise<void> | null = null;
  private runPlayer: YTPlayer | null = null;
  private winPlayerA: YTPlayer | null = null;
  private winPlayerB: YTPlayer | null = null;
  private unlocked = false;
  private runUsingFallback = false;

  unlockFromUserGesture(): void {
    this.unlocked = true;
  }

  async playRunMusic(): Promise<void> {
    if (!this.unlocked) return;
    await this.ensurePlayers();
    if (!this.runPlayer || !this.winPlayerA || !this.winPlayerB) return;

    this.winPlayerA.stopVideo();
    this.winPlayerB.stopVideo();
    this.runUsingFallback = false;
    this.runPlayer.loadVideoById(RUN_MUSIC_ID);
    this.runPlayer.playVideo();
  }

  async playFailMusic(): Promise<void> {
    if (!this.unlocked) return;
    await this.ensurePlayers();
    if (!this.runPlayer || !this.winPlayerA || !this.winPlayerB) return;

    this.winPlayerA.stopVideo();
    this.winPlayerB.stopVideo();
    this.runUsingFallback = true;
    this.runPlayer.loadVideoById({
      videoId: RUN_FALLBACK_ID,
      startSeconds: FAIL_MUSIC_START_SECONDS,
    });
    this.runPlayer.playVideo();
  }

  async playWinMusic(): Promise<void> {
    if (!this.unlocked) return;
    await this.ensurePlayers();
    if (!this.runPlayer || !this.winPlayerA || !this.winPlayerB) return;

    this.runPlayer.stopVideo();
    this.winPlayerA.loadVideoById(WIN_MUSIC_IDS[0]);
    this.winPlayerB.loadVideoById(WIN_MUSIC_IDS[1]);
    this.winPlayerA.playVideo();
    this.winPlayerB.playVideo();
  }

  stopAll(): void {
    this.runPlayer?.stopVideo();
    this.winPlayerA?.stopVideo();
    this.winPlayerB?.stopVideo();
  }

  private async ensurePlayers(): Promise<void> {
    await this.ensureYouTubeApi();
    if (this.runPlayer && this.winPlayerA && this.winPlayerB) {
      if (this.playersReadyPromise) {
        await this.playersReadyPromise;
      }
      return;
    }

    if (this.playersReadyPromise) {
      await this.playersReadyPromise;
      return;
    }

    const yt = window.YT;
    if (!yt) return;

    const runContainer = this.ensureHiddenContainer("yt-run-player");
    const winContainerA = this.ensureHiddenContainer("yt-win-player-a");
    const winContainerB = this.ensureHiddenContainer("yt-win-player-b");

    let pendingReady = 3;
    this.playersReadyPromise = new Promise<void>((resolve) => {
      const markReady = () => {
        pendingReady -= 1;
        if (pendingReady <= 0) {
          resolve();
        }
      };

      this.runPlayer = new yt.Player(runContainer.id, {
        width: "0",
        height: "0",
        videoId: RUN_MUSIC_ID,
        playerVars: {
          autoplay: 0,
          controls: 0,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: () => {
            markReady();
          },
          onError: () => {
            if (!this.runPlayer || this.runUsingFallback) return;
            this.runUsingFallback = true;
            this.runPlayer.loadVideoById({
              videoId: RUN_FALLBACK_ID,
              startSeconds: FAIL_MUSIC_START_SECONDS,
            });
            this.runPlayer.playVideo();
          },
        },
      });

      this.winPlayerA = new yt.Player(winContainerA.id, {
        width: "0",
        height: "0",
        videoId: WIN_MUSIC_IDS[0],
        playerVars: {
          autoplay: 0,
          controls: 0,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: () => {
            markReady();
          },
        },
      });

      this.winPlayerB = new yt.Player(winContainerB.id, {
        width: "0",
        height: "0",
        videoId: WIN_MUSIC_IDS[1],
        playerVars: {
          autoplay: 0,
          controls: 0,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: () => {
            markReady();
          },
        },
      });
    });

    await this.playersReadyPromise;
  }

  private ensureHiddenContainer(id: string): HTMLDivElement {
    let node = document.getElementById(id) as HTMLDivElement | null;
    if (node) return node;

    node = document.createElement("div");
    node.id = id;
    node.style.position = "fixed";
    node.style.left = "-9999px";
    node.style.top = "-9999px";
    node.style.width = "1px";
    node.style.height = "1px";
    node.style.opacity = "0";
    node.style.pointerEvents = "none";
    document.body.appendChild(node);
    return node;
  }

  private ensureYouTubeApi(): Promise<void> {
    if (window.YT?.Player) {
      return Promise.resolve();
    }

    if (this.apiReadyPromise) {
      return this.apiReadyPromise;
    }

    this.apiReadyPromise = new Promise<void>((resolve) => {
      const previousReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previousReady?.();
        resolve();
      };

      const existing = document.querySelector<HTMLScriptElement>(
        'script[src="https://www.youtube.com/iframe_api"]',
      );
      if (existing) return;

      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    });

    return this.apiReadyPromise;
  }
}
