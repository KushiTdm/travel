import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { heroFlag } from '@/lib/heroFlags';
import {
  CAMERA_HEIGHT,
  DEPTH,
  DOLLY_MAX,
  FIXATION_Z,
  HORIZON_Y,
  K,
  SWAY_X,
  SWAY_Y,
  VANISH_X,
  dollyScale,
  lateralShift,
  rockingShift,
  verticalShift,
} from '@/lib/parallaxModel';

/**
 * The whole scene is drawn in ONE WebGL canvas. Stacking a dozen scaled, translated DOM layers
 * made Chromium drop compositor tiles while scrolling (solid orange rectangles flashing, from the
 * sky behind showing through); a single canvas has no per-layer tiles to lose.
 */

/** Scene height / width, from the 1920x1072 layers. */
const SCENE_RATIO = 1072 / 1920;

type Kind = 'sky' | 'image' | 'water';
interface Layer {
  id: string;
  src: string;
  kind: Kind;
  /** Depth in metres (see parallaxModel.ts). */
  z: number;
  /** Placement in the scene: left, top, width, height as shares. */
  rect: [number, number, number, number];
}

/** Back to front. Each layer only declares its depth: the camera model derives its motion. */
const LAYERS: Layer[] = [
  { id: 'sky', src: '/hero/sky.webp', kind: 'sky', z: DEPTH.sky, rect: [0, -0.03, 1, 0.57] },
  { id: 'p4', src: '/hero/p4.webp', kind: 'image', z: DEPTH.p4, rect: [0, 0, 1, 1] },
  { id: 'water', src: '/hero/water.webp', kind: 'water', z: 0, rect: [0, HORIZON_Y, 1, 1 - HORIZON_Y] },
  { id: 'p3', src: '/hero/p3.webp', kind: 'image', z: DEPTH.p3, rect: [0, 0, 1, 1] },
  { id: 'p2', src: '/hero/p2.webp', kind: 'image', z: DEPTH.p2, rect: [0, 0, 1, 1] },
  { id: 'p1', src: '/hero/p1.webp', kind: 'image', z: DEPTH.p1, rect: [0, 0, 1, 1] },
  { id: 'boat', src: '/hero/boat.webp', kind: 'image', z: DEPTH.boat, rect: [0, 0, 1, 1] },
];

const VERT = `
attribute vec2 p;            // 0..1, y down
uniform vec4 rect;           // left, top, width, height (scene shares)
uniform vec2 vp;             // vanishing point (scene shares)
uniform float sc;            // dolly scale about the vanishing point
uniform vec2 off;            // translation (scene shares)
uniform vec4 view;           // scene -> clip: scale x, scale y, bias x, bias y
varying vec2 v;              // y up, as the texture is uploaded flipped
void main() {
  vec2 s = vec2(rect.x + p.x * rect.z, rect.y + p.y * rect.w);
  s = vp + (s - vp) * sc + off;
  gl_Position = vec4(s.x * view.x + view.z, s.y * view.y + view.w, 0.0, 1.0);
  v = vec2(p.x, 1.0 - p.y);
}`;

const FRAG_IMAGE = `
precision mediump float;
varying vec2 v;
uniform sampler2D tex;
void main() { gl_FragColor = texture2D(tex, v); }`;

const FRAG_FX = `
precision mediump float;
varying vec2 v;
uniform sampler2D tex;
uniform float time;
uniform float amp, speed, glint, persp, pulse;
uniform float ground;      // 1 = ground plane seen from a moving camera (water)
uniform vec3 cam;          // camera pose: right, up, forward (metres)
uniform vec4 geo;          // K (focal/width), eye height, fixation depth, layer height / scene width
uniform vec2 freq;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1.,0.)), f.x), mix(hash(i+vec2(0.,1.)), hash(i+vec2(1.,1.)), f.x), f.y);
}
float fbm(vec2 p){ return noise(p)*0.55 + noise(p*2.03+7.1)*0.3 + noise(p*4.1+3.7)*0.15; }
void main(){
  float near = 1.0 - v.y;
  float k = mix(1.0, 0.2 + 1.8*near, persp);
  float t = time*speed;
  vec2 q = v*freq;
  vec2 d = vec2(fbm(q + vec2(t, 0.0)), fbm(q + vec2(5.2, 1.3) - vec2(0.0, t))) - 0.5;
  vec2 base = v;
  if (ground > 0.5) {
    // Ground plane: depth Z = f*H/r, so 1/Z grows linearly with the distance r below the horizon.
    float rn = max((1.0 - v.y)*geo.w, 0.0005);
    float src = rn * geo.y / (geo.y + cam.y);
    src = src / (1.0 + cam.z * src / (geo.x*geo.y));
    float du = cam.x * (geo.x/geo.z - rn/geo.y);
    base = vec2(v.x - du, 1.0 - src/geo.w);
  }
  vec2 uv = base + d*amp*k;
  vec4 c = texture2D(tex, clamp(uv, 0.002, 0.998));
  float lum = dot(c.rgb, vec3(0.299,0.587,0.114));
  float g = fbm(v*vec2(freq.x*7.0, freq.y*16.0) + vec2(t*2.0, -t));
  float sp = smoothstep(0.64, 0.92, g) * smoothstep(0.32, 0.75, lum) * glint * k;
  c.rgb += vec3(1.0, 0.84, 0.58) * sp * c.a;
  c.rgb *= 1.0 + pulse*(sin(time*speed*1.7)*0.5 + 0.5);
  gl_FragColor = c;
}`;

interface FxParams {
  amp: number;
  freq: [number, number];
  speed: number;
  glint: number;
  persp: number;
  pulse: number;
}
const WATER: FxParams = { amp: 0.012, freq: [5, 9], speed: 0.16, glint: 0.55, persp: 1, pulse: 0.02 };
const SKY: FxParams = { amp: 0.006, freq: [1.6, 1.1], speed: 0.05, glint: 0, persp: 0, pulse: 0.025 };

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, source);
  gl.compileShader(s);
  return s;
}

function program(gl: WebGLRenderingContext, frag: string): WebGLProgram | null {
  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, frag));
  gl.bindAttribLocation(prog, 0, 'p');
  gl.linkProgram(prog);
  return gl.getProgramParameter(prog, gl.LINK_STATUS) ? prog : null;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

interface Props {
  className?: string;
}

function HeroScene({ className }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const host = el.parentElement as HTMLElement;
    const gl = el.getContext('webgl', { alpha: false, antialias: false, premultipliedAlpha: true });
    const progImage = gl && program(gl, FRAG_IMAGE);
    const progFx = gl && program(gl, FRAG_FX);
    if (!gl || !progImage || !progFx) {
      setFallback(true);
      return;
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); // textures are uploaded premultiplied
    gl.clearColor(0.11, 0.094, 0.251, 1);

    const uni = (p: WebGLProgram, name: string) => gl.getUniformLocation(p, name);
    const common = (p: WebGLProgram) => ({
      rect: uni(p, 'rect'),
      vp: uni(p, 'vp'),
      sc: uni(p, 'sc'),
      off: uni(p, 'off'),
      view: uni(p, 'view'),
      tex: uni(p, 'tex'),
    });
    const locImage = common(progImage);
    const locFx = {
      ...common(progFx),
      time: uni(progFx, 'time'),
      amp: uni(progFx, 'amp'),
      speed: uni(progFx, 'speed'),
      glint: uni(progFx, 'glint'),
      persp: uni(progFx, 'persp'),
      pulse: uni(progFx, 'pulse'),
      ground: uni(progFx, 'ground'),
      cam: uni(progFx, 'cam'),
      geo: uni(progFx, 'geo'),
      freq: uni(progFx, 'freq'),
    };

    const textures = new Map<string, WebGLTexture>();
    let ready = false;
    let cancelled = false;

    const dpr = Math.min(window.devicePixelRatio || 1, (navigator.hardwareConcurrency ?? 8) <= 4 ? 1 : 1.5);
    let cw = 1;
    let ch = 1;
    const resize = () => {
      cw = Math.max(1, Math.round(host.clientWidth * dpr));
      ch = Math.max(1, Math.round(host.clientHeight * dpr));
      el.width = cw;
      el.height = ch;
      gl.viewport(0, 0, cw, ch);
    };
    resize();
    const ro = new ResizeObserver(() => {
      resize();
      draw(last);
    });
    ro.observe(host);

    // Camera state: mouse = head sway, scroll = forward glide, both eased.
    let tx = 0;
    let ty = 0;
    let mx = 0;
    let my = 0;
    let last = 0;

    const draw = (time: number) => {
      if (!ready) return;
      last = time;
      const hostH = host.offsetHeight;
      const sy = window.scrollY;

      mx += (tx - mx) * 0.07;
      my += (ty - my) * 0.07;
      const dx = mx * 2 * SWAY_X;
      const dy = -my * 2 * SWAY_Y;
      const dz = DOLLY_MAX * Math.min(sy / hostH, 1.1);

      // The scene covers the canvas with a 10 % overscan, centred.
      const Ws = Math.max(1.1 * cw, 1.1 * ch * (1920 / 1072));
      const Hs = Ws * SCENE_RATIO;
      const view: [number, number, number, number] = [(2 * Ws) / cw, (-2 * Hs) / ch, -Ws / cw, Hs / ch];

      gl.clear(gl.COLOR_BUFFER_BIT);
      LAYERS.forEach((layer, i) => {
        const tex = textures.get(layer.src);
        if (!tex) return;
        let offU = 0;
        let offV = 0;
        let sc = 1;
        if (layer.kind !== 'water') {
          offU = lateralShift(dx, layer.z);
          offV = layer.id === 'boat'
            ? verticalShift(dy, layer.z) / SCENE_RATIO
            : (verticalShift(dy, layer.z) + rockingShift(time, layer.z)) / SCENE_RATIO;
          if (layer.id !== 'boat') sc = heroFlag('noscale') ? 1 : dollyScale(layer.z, dz);
        }
        const loc = layer.kind === 'image' ? locImage : locFx;
        gl.useProgram(layer.kind === 'image' ? progImage : progFx);
        gl.activeTexture(gl.TEXTURE0 + (i % 8));
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.uniform1i(loc.tex, i % 8);
        gl.uniform4f(loc.rect, layer.rect[0], layer.rect[1], layer.rect[2], layer.rect[3]);
        gl.uniform2f(loc.vp, VANISH_X, HORIZON_Y);
        gl.uniform1f(loc.sc, sc);
        gl.uniform2f(loc.off, offU, offV);
        gl.uniform4f(loc.view, view[0], view[1], view[2], view[3]);
        if (layer.kind !== 'image') {
          const fx = layer.kind === 'water' ? WATER : SKY;
          gl.uniform1f(locFx.time, time);
          gl.uniform1f(locFx.amp, fx.amp);
          gl.uniform1f(locFx.speed, fx.speed);
          gl.uniform1f(locFx.glint, fx.glint);
          gl.uniform1f(locFx.persp, fx.persp);
          gl.uniform1f(locFx.pulse, fx.pulse);
          gl.uniform2f(locFx.freq, fx.freq[0], fx.freq[1]);
          gl.uniform1f(locFx.ground, layer.kind === 'water' ? 1 : 0);
          gl.uniform3f(locFx.cam, dx, dy, dz);
          gl.uniform4f(locFx.geo, K, CAMERA_HEIGHT, FIXATION_Z, (1 - HORIZON_Y) * SCENE_RATIO);
        }
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      });
    };

    const tick = () => {
      if (window.scrollY > host.offsetHeight * 1.1 || document.hidden) return;
      draw(gsap.ticker.time);
    };

    const onMove = (e: PointerEvent) => {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
    };
    if (fine && !reduced) host.addEventListener('pointermove', onMove);

    const onLost = (e: Event) => {
      e.preventDefault();
      setFallback(true);
    };
    el.addEventListener('webglcontextlost', onLost);

    Promise.all(LAYERS.map((l) => loadImage(l.src).then((img) => [l.src, img] as const)))
      .then((loaded) => {
        if (cancelled) return;
        loaded.forEach(([src, img]) => {
          const tex = gl.createTexture()!;
          gl.bindTexture(gl.TEXTURE_2D, tex);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
          gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          textures.set(src, tex);
        });
        ready = true;
        draw(0);
        el.style.visibility = 'visible'; // everything at once, no partial pop-in
        if (!reduced) gsap.ticker.add(tick);
      })
      .catch(() => setFallback(true));

    return () => {
      cancelled = true;
      gsap.ticker.remove(tick);
      ro.disconnect();
      host.removeEventListener('pointermove', onMove);
      el.removeEventListener('webglcontextlost', onLost);
      // No loseContext(): React StrictMode remounts reuse this canvas and a lost context cannot be recreated.
      textures.forEach((t) => gl.deleteTexture(t));
      gl.deleteProgram(progImage);
      gl.deleteProgram(progFx);
      gl.deleteBuffer(quad);
    };
  }, []);

  if (fallback) {
    // No WebGL: a static, flat stack of the same layers.
    return (
      <div className={className} aria-hidden="true">
        {LAYERS.map((l) => (
          <img
            key={l.id}
            src={l.src}
            alt=""
            draggable={false}
            className="absolute left-1/2 w-[110%] -translate-x-1/2 select-none"
            style={{ top: `${l.rect[1] * 100}%`, height: `${l.rect[3] * 100}%` }}
          />
        ))}
      </div>
    );
  }
  return <canvas ref={canvas} className={className} style={{ visibility: 'hidden' }} aria-hidden="true" />;
}

export default HeroScene;
