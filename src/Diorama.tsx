import type { BufferGeometry, NormalBufferAttributes } from 'three';
import { useEffect, useRef, useState } from 'react';

export default function Diorama() {
  const host = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const mount = host.current;
    if (!mount) return;
    let cancelled = false;
    let dispose = () => {};
    let startTimer = 0;
    const start = async () => {
      try {
        const T = await import('three');
        if (cancelled) return;
        const renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = T.SRGBColorSpace;
        mount.appendChild(renderer.domElement);
        const scene = new T.Scene();
        const camera = new T.PerspectiveCamera(32, 1, .1, 40);
        camera.position.set(5.5, 4.2, 8.5);
        camera.lookAt(0, .35, 0);
        scene.add(new T.HemisphereLight(0xffffff, 0x869cce, 2.8));
        const light = new T.DirectionalLight(0xfffaf3, 3.5);
        light.position.set(-4, 7, 5); scene.add(light);
        const world = new T.Group(); scene.add(world);
        const materials = new Map<string, InstanceType<typeof T.MeshStandardMaterial>>();
        const material = (color: string) => {
          if (!materials.has(color)) materials.set(color, new T.MeshStandardMaterial({ color, roughness: .85, metalness: 0, flatShading: true }));
          return materials.get(color)!;
        };
        const mesh = (geometry: BufferGeometry<NormalBufferAttributes>, color: string, x: number, y: number, z: number, parent = world) => {
          const object = new T.Mesh(geometry, material(color)); object.position.set(x, y, z); parent.add(object); return object;
        };
        const base = mesh(new T.CylinderGeometry(2.22, 1.83, .62, 9), '#a4bee3', 0, -.6, 0); base.rotation.y = .12;
        mesh(new T.CylinderGeometry(2.18, 2.22, .16, 64), '#f7fbf5', 0, -.22, 0);
        const pond = mesh(new T.CylinderGeometry(1.82, 1.82, .035, 64), '#b7dff0', 0, -.12, 0); pond.scale.z = .83;
        const rim = mesh(new T.TorusGeometry(1.95, .035, 7, 80), '#7592c6', 0, -.105, 0); rim.rotation.x = Math.PI / 2;
        const stone = (x: number, z: number, size: number, color: string) => { const object = mesh(new T.DodecahedronGeometry(size), color, x, -.02, z); object.scale.y = .46; };
        stone(-1.5, .15, .38, '#c0b6e9'); stone(-1.75, -.2, .23, '#a799d5'); stone(1.65, .1, .32, '#c9def2');
        for (const [x, z, height] of [[-1.45, -.75, .95], [-1.88, -.5, .55], [1.35, -.8, .7]]) {
          const crystal = mesh(new T.ConeGeometry(.22, height, 5), '#91c7f0', x, height / 2 - .12, z); crystal.rotation.z = x * .13;
          mesh(new T.ConeGeometry(.2, height * .23, 5), '#d9edf7', x, -.2, z).rotation.x = Math.PI;
        }
        const blossom = (x: number, z: number, scale: number) => {
          mesh(new T.CylinderGeometry(.025, .035, .35, 6), '#818cc0', x, .03, z);
          for (let i = 0; i < 5; i++) { const angle = i * Math.PI * 2 / 5; const petal = mesh(new T.SphereGeometry(.14 * scale, 10, 8), '#f2a1b8', x + Math.cos(angle) * .14 * scale, .23 + Math.sin(angle) * .14 * scale, z); petal.scale.z = .4; }
          const centre = mesh(new T.SphereGeometry(.09 * scale, 10, 8), '#fffaf0', x, .23, z + .045); centre.scale.z = .6;
        };
        blossom(-1.1, .95, 1); blossom(-1.4, .7, .7); blossom(1.55, .65, .9);
        const book = mesh(new T.BoxGeometry(.64, .11, .47), '#6986be', 1.1, -.03, 1.05); book.rotation.y = -.5;
        const pages = mesh(new T.BoxGeometry(.55, .07, .43), '#fff8ec', 1.1, .045, 1.05); pages.rotation.y = -.5;
        const clouds: InstanceType<typeof T.Group>[] = [];
        for (const [x, y, z, scale] of [[-2.5, -.4, 1, .75], [2.3, -.45, -.1, .6], [-.3, -1.15, .5, .7]]) {
          const cloud = new T.Group(); cloud.position.set(x, y, z); cloud.scale.setScalar(scale); scene.add(cloud); clouds.push(cloud);
          for (const [cx, cy, size] of [[-.38, 0, .35], [0, .12, .48], [.42, 0, .32]]) mesh(new T.SphereGeometry(size, 16, 10), '#fcfdff', cx, cy, 0, cloud);
        }
        const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
        let reduced = motionQuery.matches;
        let visible = true;
        let contextLost = false;
        let pointer = 0;
        let animation = 0;
        let lastFrame = -Infinity;
        const render = (time: number) => {
          if (cancelled || contextLost) return;
          if (visible && time - lastFrame > 32) {
            world.rotation.y += (pointer * .24 - world.rotation.y) * .07;
            world.position.y = reduced ? 0 : Math.sin(time * .00065) * .045;
            clouds.forEach((cloud, i) => { cloud.rotation.y = reduced ? 0 : Math.sin(time * .0003 + i) * .1; });
            renderer.render(scene, camera); lastFrame = time;
          }
          if (visible && !reduced) animation = requestAnimationFrame(render);
        };
        const resize = new ResizeObserver(entries => { const { width, height } = entries[0].contentRect; if (!width || !height) return; renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.render(scene, camera); });
        resize.observe(mount);
        const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting && !document.hidden; cancelAnimationFrame(animation); if (visible) render(performance.now()); }, { rootMargin: '60px' });
        observer.observe(mount);
        const visibility = () => { visible = !document.hidden && mount.getBoundingClientRect().bottom > 0; cancelAnimationFrame(animation); if (visible) render(performance.now()); };
        const move = (event: PointerEvent) => { const rect = mount.getBoundingClientRect(); pointer = (event.clientX - rect.left) / rect.width * 2 - 1; if (reduced) render(performance.now()); };
        const reset = () => { pointer = 0; };
        const updateMotion = () => { reduced = motionQuery.matches; cancelAnimationFrame(animation); render(performance.now()); };
        motionQuery.addEventListener('change', updateMotion);
        const parent = mount.parentElement!;
        parent.addEventListener('pointermove', move); parent.addEventListener('pointerleave', reset); document.addEventListener('visibilitychange', visibility);
        const lost = (event: Event) => { event.preventDefault(); contextLost = true; cancelAnimationFrame(animation); setReady(false); };
        renderer.domElement.addEventListener('webglcontextlost', lost);
        setReady(true); render(performance.now());
        dispose = () => {
          resize.disconnect(); observer.disconnect(); cancelAnimationFrame(animation); motionQuery.removeEventListener('change', updateMotion);
          parent.removeEventListener('pointermove', move); parent.removeEventListener('pointerleave', reset); document.removeEventListener('visibilitychange', visibility);
          renderer.domElement.removeEventListener('webglcontextlost', lost);
          scene.traverse(object => { if (object instanceof T.Mesh) object.geometry.dispose(); }); materials.forEach(value => value.dispose());
          renderer.dispose(); renderer.domElement.remove();
        };
      } catch (error) { if (!cancelled) { setReady(false); console.info('Using the illustrated island; WebGL is unavailable.', error); } }
    };
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { observer.disconnect(); startTimer = window.setTimeout(start, 180); } }, { rootMargin: '100px' });
    observer.observe(mount);
    return () => { cancelled = true; clearTimeout(startTimer); observer.disconnect(); dispose(); };
  }, []);
  return <div ref={host} className={`diorama ${ready ? 'diorama-ready' : ''}`} data-renderer={ready ? 'webgl' : 'illustration'} aria-hidden="true"><div className="island-fallback"><i /><i /><i /><span /></div></div>;
}
