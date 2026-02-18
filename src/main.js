import './style.css'
import * as THREE from 'three'

const canvas = document.getElementById('sky')
const scene = new THREE.Scene()

const MAX_ZOOM = 2500
const MIN_ZOOM = 550 
const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 1, 20000)
camera.position.z = MAX_ZOOM 

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // Ограничим для производительности мобилок
renderer.setSize(canvas.clientWidth, canvas.clientHeight)

// --- ТЕКСТУРА ЗВЕЗДЫ ---
function createStarTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 128; canvas.height = 128
  const ctx = canvas.getContext('2d')
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.1, 'rgba(255,255,255,0.9)')
  gradient.addColorStop(0.3, 'rgba(180,220,255,0.5)') 
  gradient.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(canvas)
}
const starTexture = createStarTexture()

// --- ФОНОВЫЕ ЗВЕЗДЫ ---
let backgroundStars;
function createBackgroundStars() {
  const count = 15000
  const geo = new THREE.BufferGeometry()
  const pos = new Float32Array(count * 3)
  const phases = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 15000
    pos[i * 3 + 1] = (Math.random() - 0.5) * 15000
    pos[i * 3 + 2] = (Math.random() - 0.5) * 15000
    phases[i] = Math.random() * Math.PI * 2
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('phase', new THREE.BufferAttribute(phases, 1))
  const mat = new THREE.PointsMaterial({ size: 24, map: starTexture, transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false })
  backgroundStars = new THREE.Points(geo, mat)
  scene.add(backgroundStars)
}
createBackgroundStars()

// --- СОЗВЕЗДИЯ ---
const constellations = []
function createMorphConstellation(points, color = 0x4499ff) {
  const geo = new THREE.BufferGeometry().setFromPoints(points)
  const initial = points.map(p => p.clone())
  const target = points.map(() => {
    const radius = Math.random() * 350 + 50 
    const angle = Math.random() * Math.PI * 2
    return new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, (Math.random() - 0.5) * 50)
  })
  const starMat = new THREE.PointsMaterial({ size: 38, map: starTexture, color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })
  const stars = new THREE.Points(geo, starMat)
  const lineMat = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0, blending: THREE.AdditiveBlending })
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([...points, points[0]]), lineMat)
  scene.add(stars, line)
  constellations.push({ mesh: stars, line: line, initialPositions: initial, targetPositions: target })
}
createMorphConstellation([new THREE.Vector3(-150, 100, 0), new THREE.Vector3(0, 200, 0), new THREE.Vector3(150, 100, 0), new THREE.Vector3(50, -50, 0)])
createMorphConstellation([new THREE.Vector3(400, 300, 0), new THREE.Vector3(450, 400, 0), new THREE.Vector3(550, 300, 0), new THREE.Vector3(650, 400, 0), new THREE.Vector3(700, 300, 0)], 0xff66aa)
createMorphConstellation([new THREE.Vector3(-600, -100, 0), new THREE.Vector3(-450, -50, 0), new THREE.Vector3(-350, -50, 0), new THREE.Vector3(-250, -150, 0), new THREE.Vector3(-200, -300, 0), new THREE.Vector3(-400, -350, 0), new THREE.Vector3(-550, -300, 0)], 0x66ffaa)

// --- ГАЛАКТИКА ---
const galaxyGroup = new THREE.Group()
function createGalaxy() {
  const armCount = 18000, coreCount = 5000
  const armGeo = new THREE.BufferGeometry(), armPos = new Float32Array(armCount * 3), armCols = new Float32Array(armCount * 3)
  for (let i = 0; i < armCount; i++) {
    const radius = Math.random() * 550, spin = radius * 0.012, branch = (i % 3) * ((Math.PI * 2) / 3)
    armPos[i * 3] = Math.cos(branch + spin) * radius + (Math.random()-0.5)*60
    armPos[i * 3 + 1] = Math.sin(branch + spin) * radius + (Math.random()-0.5)*60
    armPos[i * 3 + 2] = (Math.random() - 0.5) * 100
    const color = new THREE.Color().lerpColors(new THREE.Color(0xffcc88), new THREE.Color(0x3366ff), radius/550)
    armCols[i * 3] = color.r; armCols[i * 3 + 1] = color.g; armCols[i * 3 + 2] = color.b
  }
  armGeo.setAttribute('position', new THREE.BufferAttribute(armPos, 3))
  armGeo.setAttribute('color', new THREE.BufferAttribute(armCols, 3))
  const armsMat = new THREE.PointsMaterial({ size: 8, map: starTexture, vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })
  const coreGeo = new THREE.BufferGeometry(), corePos = new Float32Array(coreCount * 3)
  for (let i = 0; i < coreCount; i++) {
    const r = Math.pow(Math.random(), 2.5) * 100, t = Math.random() * Math.PI * 2, p = Math.acos(2 * Math.random() - 1)
    corePos[i * 3] = r * Math.sin(p) * Math.cos(t); corePos[i * 3 + 1] = r * Math.sin(p) * Math.sin(t); corePos[i * 3 + 2] = r * Math.cos(p)
  }
  coreGeo.setAttribute('position', new THREE.BufferAttribute(corePos, 3))
  const coreMat = new THREE.PointsMaterial({ size: 24, map: starTexture, color: 0xfff0dd, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })
  galaxyGroup.add(new THREE.Points(armGeo, armsMat), new THREE.Points(coreGeo, coreMat))
  scene.add(galaxyGroup)
  return { armsMat, coreMat }
}
const galaxy = createGalaxy()

// --- УПРАВЛЕНИЕ (MOUSE & TOUCH) ---
let targetZ = MAX_ZOOM
let mouseX = 0, mouseY = 0
let lastTouchY = 0

// Десктопный скролл
canvas.addEventListener('wheel', (e) => {
  e.preventDefault()
  targetZ += e.deltaY * 2.2
  targetZ = THREE.MathUtils.clamp(targetZ, MIN_ZOOM, MAX_ZOOM)
}, { passive: false })

// Мобильный тач
canvas.addEventListener('touchstart', (e) => {
  lastTouchY = e.touches[0].clientY
}, { passive: false })

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault() // Чтобы страница не скроллилась
  const touchY = e.touches[0].clientY
  const deltaY = lastTouchY - touchY
  
  // Эмуляция скролла: движение вверх - приближение
  targetZ += deltaY * 4
  targetZ = THREE.MathUtils.clamp(targetZ, MIN_ZOOM, MAX_ZOOM)
  
  // Параллакс по тачу
  mouseX = (e.touches[0].clientX - window.innerWidth / 2) * 0.0005
  mouseY = (e.touches[0].clientY - window.innerHeight / 2) * 0.0005
  
  lastTouchY = touchY
}, { passive: false })

window.addEventListener('mousemove', e => {
  mouseX = (e.clientX - window.innerWidth / 2) * 0.0003
  mouseY = (e.clientY - window.innerHeight / 2) * 0.0003
})

// --- ОБНОВЛЕНИЕ ---
function updateVisibility(time) {
  const progress = (MAX_ZOOM - camera.position.z) / (MAX_ZOOM - MIN_ZOOM)
  const ease = (val, s, e) => THREE.MathUtils.smoothstep(val, s, e)

  backgroundStars.material.opacity = 0.7 + Math.sin(time * 2) * 0.3

  constellations.forEach(c => {
    c.mesh.material.opacity = ease(progress, 0, 0.25) * (Math.sin(time * 3.5) * 0.3 + 0.7)
    const lAlpha = ease(progress, 0.3, 0.5) - ease(progress, 0.6, 0.75)
    c.line.material.opacity = Math.max(0, lAlpha * 0.4)
    const mProgress = ease(progress, 0.55, 0.95)
    const posAttr = c.mesh.geometry.attributes.position
    for (let i = 0; i < c.initialPositions.length; i++) {
      const start = c.initialPositions[i], end = c.targetPositions[i]
      posAttr.array[i * 3] = THREE.MathUtils.lerp(start.x, end.x, mProgress)
      posAttr.array[i * 3 + 1] = THREE.MathUtils.lerp(start.y, end.y, mProgress)
      posAttr.array[i * 3 + 2] = THREE.MathUtils.lerp(start.z, end.z, mProgress)
    }
    posAttr.needsUpdate = true
  })

  galaxy.coreMat.opacity = ease(progress, 0.6, 0.85)
  galaxy.armsMat.opacity = ease(progress, 0.8, 1.0)
}

function animate(time) {
  const t = time * 0.001
  camera.position.z += (targetZ - camera.position.z) * 0.05
  updateVisibility(t)
  
  galaxyGroup.rotation.z += 0.0008
  scene.rotation.x += (mouseY - scene.rotation.x) * 0.04
  scene.rotation.y += (mouseX - scene.rotation.y) * 0.04
  
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}
animate()

window.addEventListener('resize', () => {
  camera.aspect = canvas.clientWidth / canvas.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(canvas.clientWidth, canvas.clientHeight)
})