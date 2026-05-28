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
      };
    },
  ) => YTPlayer;
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

type PendingAction = "run" | "fail" | "win" | "stop";

export class GameAudio {
  private runPlayer: YTPlayer | null = null;
  private winPlayerA: YTPlayer | null = null;
  private winPlayerB: YTPlayer | null = null;

  // How many of the 3 players have fired onReady
  private readyCount = 0;
  private allReady = false;

  // Has the user unlocked audio via a gesture yet?
  private unlocked = false;
  // Have we already sent a play()/stop() touch to each player to unlock it on iOS?
  private iosUnlockDone = false;

  private pendingAction: PendingAction | null = null;
  private runUsingFallback = false;

  constructor() {
    // Eagerly load the YT API so players are ready before the first tap.
    this.initApi();
  }

  // Called synchronously from the first user gesture (tap/keypress).
  unlockFromUserGesture(): void {
    this.unlocked = true;
    // On iOS, playVideo() must be called in the synchronous gesture handler.
    // We call it on every ready player now to "warm up" the audio context,
    // then immediately stop – this unlocks playback for future async calls.
    this.tryIosUnlock();
  }

  playRunMusic(): void {
    if (!this.unlocked) return;
    if (this.allReady) {
      this.execRunMusic();
    } else {
      this.pendingAction = "run";
    }
  }

  playFailMusic(): void {
    if (!this.unlocked) return;
    if (this.allReady) {
      this.execFailMusic();
    } else {
      this.pendingAction = "fail";
    }
  }

  playWinMusic(): void {
    if (!this.unlocked) return;
    if (this.allReady) {
      this.execWinMusic();
    } else {
      this.pendingAction = "win";
    }
  }

  stopAll(): void {
    this.pendingAction = null;
    this.runPlayer?.stopVideo();
    this.winPlayerA?.stopVideo();
    this.winPlayerB?.stopVideo();
  }

  // ── private helpers ──────────────────────────────────────────────────────

  private execRunMusic(): void {
    if (!this.runPlayer || !this.winPlayerA || !this.winPlayerB) return;
    this.winPlayerA.stopVideo();
    this.winPlayerB.stopVideo();
    this.runUsingFallback = false;
    this.runPlayer.loadVideoById(RUN_MUSIC_ID);
    this.runPlayer.playVideo();
  }

  private execFailMusic(): void {
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

  private execWinMusic(): void {
    if (!this.runPlayer || !this.winPlayerA || !this.winPlayerB) return;
    this.runPlayer.stopVideo();
    this.winPlayerA.loadVideoById(WIN_MUSIC_IDS[0]);
    this.winPlayerB.loadVideoById(WIN_MUSIC_IDS[1]);
    this.winPlayerA.playVideo();
    this.winPlayerB.playVideo();
  }

  private tryIosUnlock(): void {
    if (this.iosUnlockDone) return;
    // Play+stop each ready player to unlock iOS audio context synchronously.
    const players = [this.runPlayer, this.winPlayerA, this.winPlayerB];
    if (players.some((p) => p === null)) return; // not all ready yet; onReady will retry
    this.iosUnlockDone = true;
    for (const p of players) {
      p!.playVideo();
      p!.stopVideo();
    }
  }

  private onPlayerReady(): void {
    this.readyCount += 1;
    if (this.readyCount < 3) return;

    this.allReady = true;
    // If the user already tapped but players weren't ready, unlock now.
    // (Works reliably on Android/Chrome; on iOS this is best-effort since
    //  we're outside a gesture, but tryIosUnlock in unlockFromUserGesture
    //  handles the synchronous path.)
    if (this.unlocked && !this.iosUnlockDone) {
      this.iosUnlockDone = true;
      for (const p of [this.runPlayer, this.winPlayerA, this.winPlayerB]) {
        p!.playVideo();
        p!.stopVideo();
      }
    }
    // Execute any action that was requested before players were ready.
    if (this.unlocked && this.pendingAction) {
      const action = this.pendingAction;
      this.pendingAction = null;
      if (action === "run") this.execRunMusic();
      else if (action === "fail") this.execFailMusic();
      else if (action === "win") this.execWinMusic();
    }
  }

  private createPlayers(): void {
    const yt = window.YT;
    if (!yt) return;

    const runContainer = this.ensureHiddenContainer("yt-run-player");
    const winContainerA = this.ensureHiddenContainer("yt-win-player-a");
    const winContainerB = this.ensureHiddenContainer("yt-win-player-b");

    this.runPlayer = new yt.Player(runContainer.id, {
      width: "0",
      height: "0",
      videoId: RUN_MUSIC_ID,
      playerVars: { autoplay: 0, controls: 0, rel: 0, modestbranding: 1 },
      events: {
        onReady: () => {
          // Also attempt iOS unlock for this individual player if gesture already happened.
          if (this.unlocked && !this.iosUnlockDone) {
            this.runPlayer!.playVideo();
            this.runPlayer!.stopVideo();
          }
          this.onPlayerReady();
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
      playerVars: { autoplay: 0, controls: 0, rel: 0, modestbranding: 1 },
      events: {
        onReady: () => {
          this.onPlayerReady();
        },
      },
    });

    this.winPlayerB = new yt.Player(winContainerB.id, {
      width: "0",
      height: "0",
      videoId: WIN_MUSIC_IDS[1],
      playerVars: { autoplay: 0, controls: 0, rel: 0, modestbranding: 1 },
      events: {
        onReady: () => {
          this.onPlayerReady();
        },
      },
    });
  }

  private initApi(): void {
    if (window.YT?.Player) {
      this.createPlayers();
      return;
    }

    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      this.createPlayers();
    };

    if (
      document.querySelector('script[src="https://www.youtube.com/iframe_api"]')
    ) {
      return;
    }
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.head.appendChild(script);
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
}
