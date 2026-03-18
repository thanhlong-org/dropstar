// --- 1. KHỞI TẠO THREE.JS ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// --- 2. SHADERS (Sương mù vũ trụ xanh mờ ảo - Không dải ngân hà) ---
const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragmentShader = `
    uniform float uTime;
    varying vec2 vUv;

    float noise(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    float smoothNoise(vec2 p) {
        vec2 i = floor(p); vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(noise(i), noise(i + vec2(1.0, 0.0)), f.x), mix(noise(i + vec2(0.0, 1.0)), noise(i + vec2(1.0, 1.0)), f.x), f.y);
    }

    float fbm(vec2 p) {
        float v = 0.0; float a = 0.5;
        for (int i = 0; i < 6; i++) {
            v += a * smoothNoise(p); p *= 2.0; a *= 0.5;
        }
        return v;
    }

    void main() {
        vec2 uv = vUv;
        vec2 flowUv = uv + vec2(uTime * 0.002, uTime * 0.003);
        float n = fbm(flowUv * 2.0);

        // Bảng màu xanh rực rỡ theo ảnh mẫu
        vec3 color1 = vec3(0.01, 0.05, 0.12); // Deep Space Blue
        vec3 color2 = vec3(0.02, 0.12, 0.28); // Midnight Blue
        vec3 color3 = vec3(0.05, 0.25, 0.5);  // Vibrant Cosmic Blue

        vec3 finalColor = mix(color1, color2, n);
        finalColor = mix(finalColor, color3, pow(n, 2.5));

        float alpha = n * 0.5;
        gl_FragColor = vec4(finalColor, clamp(alpha, 0.1, 0.7));
    }
`;

// --- 3. TẠO 10,000 VÌ SAO DÀY ĐẶC ---
function createCircleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
}

const starsGeometry = new THREE.BufferGeometry();
const starsCount = 10000;
const posArray = new Float32Array(starsCount * 3);
for(let i=0; i<starsCount*3; i++) posArray[i] = (Math.random()-0.5)*130;
starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const starsMaterial = new THREE.PointsMaterial({
    size: 0.2,
    color: 0xe0f0ff, // Trắng xanh nhạt
    map: createCircleTexture(),
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});
const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

// Lớp sương mù Nebula
const nebulaMat = new THREE.ShaderMaterial({
    vertexShader, fragmentShader, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, uniforms: { uTime: { value: 0 } }
});
const nebula = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), nebulaMat);
nebula.position.z = -12;
scene.add(nebula);

camera.position.z = 5;

// --- 4. ANIMATION & HIỆU ỨNG ---
const clock = new THREE.Clock();
function animate() {
    const time = clock.getElapsedTime();
    nebulaMat.uniforms.uTime.value = time;
    stars.rotation.y = time * 0.01; // Xoay nhẹ
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();

// GSAP Animations
if (typeof gsap !== 'undefined') {
    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    const bannerTitle = document.getElementById('banner-title');
    const bannerSub = document.getElementById('banner-sub');

    if (bannerTitle) {
        gsap.from(bannerTitle, { opacity: 0, y: -50, duration: 2, ease: 'power4.out' });
    }

    if (bannerSub) {
        gsap.from(bannerSub, { opacity: 0, y: -20, duration: 2, delay: 0.5, ease: 'power4.out' });
    }

    // Hiệu ứng Parallax khi cuộn
    gsap.to(stars.scale, {
        x: 1.2, y: 1.2, z: 1.2,
        scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 1 }
    });
}

// Xử lý Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
