"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

// ---------------------------------------------------------------------------
// Durées (en ms)
// ---------------------------------------------------------------------------
const FADE_DURATION_MS = 500;
const DEATH_DURATION_MS = 500;
const PREATTACK_JELLO_DURATION_MS = 500;
const ATTACK_PULSE_DURATION_MS = 300;
const HIT_WOBBLE_DURATION_MS = 800;
const ATTACK_DELAY_MS = 200;

// 2e partie
const BOUNCE_DURATION_MS = 1000;
const SHAKE_DURATION_MS = 750;
const FLIP_DURATION_MS = 500;

const ROTATE_CENTER_DURATION_MS = 800;
const ROTATE_TOP_DURATION_MS = 700;

// ---------------------------------------------------------------------------
// Keyframes (animations JavaScript via element.animate)
// ---------------------------------------------------------------------------
const FADE_IN: Keyframe[] = [{ opacity: 0 }, { opacity: 1 }];
const FADE_OUT: Keyframe[] = [{ opacity: 1 }, { opacity: 0 }];

const WOBBLE_HOR_BOTTOM: Keyframe[] = [
  { offset: 0, transform: "translateX(0%) rotate(0deg)" },
  { offset: 0.15, transform: "translateX(-30px) rotate(-6deg)" },
  { offset: 0.3, transform: "translateX(15px) rotate(6deg)" },
  { offset: 0.45, transform: "translateX(-15px) rotate(-3.6deg)" },
  { offset: 0.6, transform: "translateX(9px) rotate(2.4deg)" },
  { offset: 0.75, transform: "translateX(-6px) rotate(-1.2deg)" },
  { offset: 1, transform: "translateX(0%) rotate(0deg)" },
];

const ROTATE_CENTER: Keyframe[] = [
  { transform: "rotate(0deg)" },
  { transform: "rotate(360deg)" },
];

const ROTATE_HOR_TOP: Keyframe[] = [
  { transform: "rotateX(0deg)" },
  { transform: "rotateX(-360deg)" },
];

// shakeX (ng-animate) : 10 segments alternés
const SHAKE_X: Keyframe[] = Array.from({ length: 11 }, (_, i) => ({
  offset: i / 10,
  transform:
    i === 0 || i === 10
      ? "translateX(0)"
      : i % 2 === 1
        ? "translateX(-10px)"
        : "translateX(10px)",
}));

// pulse (ng-animate) : agrandissement au milieu
const PULSE: Keyframe[] = [
  { transform: "scale(1)" },
  { offset: 0.5, transform: "scale(4.5)" },
  { transform: "scale(1)" },
];

// jello (ng-animate)
const JELLO: Keyframe[] = [
  { offset: 0, transform: "none" },
  { offset: 0.111, transform: "none" },
  { offset: 0.222, transform: "skew(-12.5deg, -12.5deg)" },
  { offset: 0.333, transform: "skew(6.25deg, 6.25deg)" },
  { offset: 0.444, transform: "skew(-3.125deg, -3.125deg)" },
  { offset: 0.555, transform: "skew(1.5625deg, 1.5625deg)" },
  { offset: 0.666, transform: "skew(-0.78125deg, -0.78125deg)" },
  { offset: 0.777, transform: "skew(0.390625deg, 0.390625deg)" },
  { offset: 0.888, transform: "skew(-0.1953125deg, -0.1953125deg)" },
  { offset: 1, transform: "none" },
];

// bounce (ng-animate)
const BOUNCE: Keyframe[] = [
  { offset: 0, transform: "translateY(0)" },
  { offset: 0.2, transform: "translateY(0)" },
  { offset: 0.4, transform: "translateY(-30px)" },
  { offset: 0.5, transform: "translateY(0)" },
  { offset: 0.6, transform: "translateY(-15px)" },
  { offset: 0.8, transform: "translateY(0)" },
  { offset: 1, transform: "translateY(0)" },
];

// flip (ng-animate)
const FLIP: Keyframe[] = [
  { offset: 0, transform: "perspective(400px) rotateY(-360deg)", easing: "ease-out" },
  { offset: 0.4, transform: "perspective(400px) translateZ(150px) rotateY(-190deg)", easing: "ease-out" },
  { offset: 0.5, transform: "perspective(400px) translateZ(150px) rotateY(-170deg)", easing: "ease-in" },
  { offset: 0.8, transform: "perspective(400px) scale(0.95) rotateY(0deg)", easing: "ease-in" },
  { offset: 1, transform: "perspective(400px) scale(1) rotateY(0deg)" },
];

// ---------------------------------------------------------------------------
// Composant qui rejoue une animation JS à chaque incrément de `trigger`
// (équivalent de `transition(':increment', ...)` d'Angular)
// ---------------------------------------------------------------------------
function Anim({
  trigger,
  keyframes,
  options,
  children,
}: {
  trigger: number;
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Ne rejoue l'animation que lorsque `trigger` change (pas à chaque rendu)
  useEffect(() => {
    if (trigger === 0) return;
    ref.current?.animate(keyframes, options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  return <div ref={ref}>{children}</div>;
}

const opts = (duration: number, extra: KeyframeAnimationOptions = {}): KeyframeAnimationOptions => ({
  duration,
  fill: "both",
  ...extra,
});

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Home() {
  const [slimeIsPresent, setSlimeIsPresent] = useState(false);

  // Compteurs qui déclenchent les animations du slime
  const [ngDeath, setNgDeath] = useState(0);
  const [ngAttack, setNgAttack] = useState(0);
  const [ngPreAttack, setNgPreAttack] = useState(0);

  // 2e partie
  const [ngBounce, setNgBounce] = useState(0);
  const [ngShake, setNgShake] = useState(0);
  const [ngFlip, setNgFlip] = useState(0);

  // Références DOM pilotées directement en JavaScript
  const slimeRef = useRef<HTMLImageElement>(null);
  const hitRef = useRef<HTMLDivElement>(null);
  const spinRef = useRef<HTMLDivElement>(null);

  const spawn = () => {
    setSlimeIsPresent(true);
    slimeRef.current?.animate(FADE_IN, { duration: FADE_DURATION_MS, fill: "forwards" });
  };

  const death = () => {
    setSlimeIsPresent(false);
    slimeRef.current?.animate(FADE_OUT, { duration: FADE_DURATION_MS, fill: "forwards" });
    setNgDeath((n) => n + 1);
  };

  const attack = async () => {
    setNgPreAttack((n) => n + 1);
    await wait(ATTACK_DELAY_MS);
    setNgAttack((n) => n + 1);
  };

  const hit = () => {
    hitRef.current?.animate(WOBBLE_HOR_BOTTOM, opts(HIT_WOBBLE_DURATION_MS));
  };

  const bounceShakeFlip = async () => {
    setNgBounce((n) => n + 1);
    await wait(BOUNCE_DURATION_MS);
    setNgShake((n) => n + 1);
    await wait(SHAKE_DURATION_MS);
    setNgFlip((n) => n + 1);
  };

  // Attend la fin d'une animation JS sur l'élément spin
  const spin = (keyframes: Keyframe[], options: KeyframeAnimationOptions) =>
    spinRef.current?.animate(keyframes, options).finished ?? Promise.resolve();

  const centerSpin = () =>
    spin(
      ROTATE_CENTER,
      opts(ROTATE_CENTER_DURATION_MS, {
        easing: "cubic-bezier(0.895, 0.030, 0.685, 0.220)",
        iterations: 2,
      }),
    );

  const topSpin = () =>
    spin(ROTATE_HOR_TOP, opts(ROTATE_TOP_DURATION_MS, { easing: "ease-in-out" }));

  const infiniteTripleSpin = async () => {
    // Boucle infinie : centre (x2) puis haut, comme dans la version Angular
    for (;;) {
      await centerSpin();
      await topSpin();
    }
  };

  const buttonStyle: CSSProperties = {
    margin: "0 8px 8px 0",
    padding: "8px 16px",
    borderRadius: 4,
    border: "none",
    background: "#ff4081",
    color: "white",
    cursor: "pointer",
    fontWeight: 500,
  };

  return (
    <div>
      <div style={{ position: "relative" }}>
        <img
          width={800}
          style={{ position: "relative", display: "block" }}
          src="/background.png"
          alt="Fond"
        />
        <div
          style={{
            width: "fit-content",
            position: "absolute",
            top: 250,
            left: 350,
          }}
        >
          <div ref={hitRef}>
            <div ref={spinRef}>
              <Anim trigger={ngDeath} keyframes={SHAKE_X} options={opts(DEATH_DURATION_MS)}>
                <Anim trigger={ngAttack} keyframes={PULSE} options={opts(ATTACK_PULSE_DURATION_MS)}>
                  <Anim trigger={ngPreAttack} keyframes={JELLO} options={opts(PREATTACK_JELLO_DURATION_MS)}>
                    <Anim trigger={ngBounce} keyframes={BOUNCE} options={opts(BOUNCE_DURATION_MS)}>
                      <Anim trigger={ngShake} keyframes={SHAKE_X} options={opts(SHAKE_DURATION_MS)}>
                        <Anim trigger={ngFlip} keyframes={FLIP} options={opts(FLIP_DURATION_MS)}>
                          <img
                            ref={slimeRef}
                            id="slimeyId"
                            width={150}
                            src="/slimeyWithBorder.png"
                            alt="Slimey"
                            style={{ opacity: 0, display: "block" }}
                          />
                        </Anim>
                      </Anim>
                    </Anim>
                  </Anim>
                </Anim>
              </Anim>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: 20 }}>
        {!slimeIsPresent && (
          <button style={buttonStyle} onClick={spawn}>
            Spawn
          </button>
        )}
        {slimeIsPresent && (
          <>
            <button style={buttonStyle} onClick={death}>
              Death
            </button>
            <button style={buttonStyle} onClick={attack}>
              Attack
            </button>
            <button style={buttonStyle} onClick={hit}>
              Hit
            </button>
            <button style={buttonStyle} onClick={bounceShakeFlip}>
              Bounce/Shake/Flip
            </button>
            <button style={buttonStyle} onClick={infiniteTripleSpin}>
              Infinite Triple Spin
            </button>
          </>
        )}
      </div>
    </div>
  );
}
