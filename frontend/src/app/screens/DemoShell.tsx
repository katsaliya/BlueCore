import { useState } from "react";

const SCREEN_W = 375;
const SCREEN_H = 760;
const BEZEL   = 14;   // frame thickness around screen
const PHONE_W = SCREEN_W + BEZEL * 2;
const PHONE_H = SCREEN_H + BEZEL * 2 + 52 + 36; // +top area (DI) +bottom area (indicator)

export default function DemoShell() {
  const [scale, setScale] = useState(1);

  // Keep phone vertically centred and shrink if needed
  const fitScale = Math.min(
    1,
    (window.innerHeight * 0.92) / PHONE_H,
    (window.innerWidth  * 0.92) / PHONE_W,
  );

  const phoneScale = scale * fitScale;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(ellipse 80% 60% at 50% 40%, #0d1b2a 0%, #050a10 100%)",
        overflow: "hidden",
        zIndex: 9999,
      }}
    >
      {/* Subtle stage glow */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(79,195,247,0.07) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -60%)",
          pointerEvents: "none",
        }}
      />

      {/* BlueCore wordmark */}
      <div
        style={{
          position: "absolute",
          top: 28,
          left: 36,
          fontFamily: "Unbounded, sans-serif",
          fontWeight: 700,
          fontSize: 18,
          color: "rgba(255,255,255,0.18)",
          letterSpacing: 2,
          textTransform: "uppercase",
        }}
      >
        BlueCore
      </div>

      {/* Scale controls */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          right: 28,
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        {[0.8, 1, 1.15].map((s) => (
          <button
            key={s}
            onClick={() => setScale(s)}
            style={{
              background:
                scale === s ? "rgba(79,195,247,0.18)" : "rgba(255,255,255,0.06)",
              border: `1px solid ${scale === s ? "rgba(79,195,247,0.35)" : "rgba(255,255,255,0.1)"}`,
              color: scale === s ? "#4fc3f7" : "rgba(255,255,255,0.4)",
              borderRadius: 8,
              padding: "4px 10px",
              fontSize: 11,
              cursor: "pointer",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            {Math.round(s * 100)}%
          </button>
        ))}
      </div>

      {/* ─── iPhone 15 Pro frame ─── */}
      <div
        style={{
          width:  PHONE_W,
          height: PHONE_H,
          transform: `scale(${phoneScale})`,
          transformOrigin: "center center",
          position: "relative",
          flexShrink: 0,
        }}
      >
        {/* Outer body */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 56,
            background:
              "linear-gradient(160deg, #2a2a2c 0%, #1a1a1c 40%, #111113 100%)",
            boxShadow: `
              0 0 0 1px rgba(255,255,255,0.10),
              0 0 0 1.5px rgba(0,0,0,0.8),
              0 30px 80px rgba(0,0,0,0.7),
              0 8px 20px rgba(0,0,0,0.5),
              inset 0 1px 0 rgba(255,255,255,0.08)
            `,
          }}
        />

        {/* Side buttons — left: volume up, volume down, silent */}
        {[72, 120, 170].map((top, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: -3,
              top,
              width: 3,
              height: i === 0 ? 32 : 36,
              background:
                "linear-gradient(to right, #1a1a1c, #2e2e30)",
              borderRadius: "2px 0 0 2px",
              boxShadow: "-1px 0 3px rgba(0,0,0,0.5)",
            }}
          />
        ))}

        {/* Side button — right: power */}
        <div
          style={{
            position: "absolute",
            right: -3,
            top: 130,
            width: 3,
            height: 68,
            background:
              "linear-gradient(to left, #1a1a1c, #2e2e30)",
            borderRadius: "0 2px 2px 0",
            boxShadow: "1px 0 3px rgba(0,0,0,0.5)",
          }}
        />

        {/* Screen surround (inner bezel) */}
        <div
          style={{
            position: "absolute",
            top: BEZEL + 52,     // below top bezel + dynamic island area
            left: BEZEL,
            width: SCREEN_W,
            height: SCREEN_H,
            borderRadius: 40,
            background: "#000",
            overflow: "hidden",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.04)",
          }}
        >
          {/* Actual app in iframe — same origin so auth/voice/nav all work */}
          <iframe
            src={`${window.location.origin}/home-v2`}
            title="BlueCore"
            allow="microphone; camera; clipboard-read; clipboard-write"
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              display: "block",
              borderRadius: 40,
              background: "#000",
            }}
          />
        </div>

        {/* Dynamic Island */}
        <div
          style={{
            position: "absolute",
            top: BEZEL + 12,
            left: "50%",
            transform: "translateX(-50%)",
            width: 120,
            height: 34,
            background: "#000",
            borderRadius: 20,
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.04)",
            zIndex: 10,
          }}
        />

        {/* Home indicator */}
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: "50%",
            transform: "translateX(-50%)",
            width: 130,
            height: 5,
            background: "rgba(255,255,255,0.3)",
            borderRadius: 3,
          }}
        />
      </div>
    </div>
  );
}
