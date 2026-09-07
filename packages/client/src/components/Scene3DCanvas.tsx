import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PlayerRole, InteractiveHotspot } from '@between-us/shared';
import { sound } from '../utils/sound';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Scene3DCanvasProps {
  sceneId: string;
  chapter: number;
  role: PlayerRole;
  hotspots?: InteractiveHotspot[];
  onSelectAction: (choiceId: string) => void;
  activeAction?: {
    initiatorRole: PlayerRole;
    actionId: string;
    actionLabelTh?: string;
    actionLabelEn?: string;
    timestamp: number;
  };
  hasChosen: boolean;
  locale: 'th' | 'en';
}

export const Scene3DCanvas: React.FC<Scene3DCanvasProps> = ({
  sceneId,
  chapter,
  role,
  hotspots = [],
  onSelectAction,
  activeAction,
  hasChosen,
  locale
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredName, setHoveredName] = useState<string | null>(null);

  // References for animating 3D scene elements
  const phoneRef = useRef<THREE.Group | null>(null);
  const phoneScreenLightRef = useRef<THREE.PointLight | null>(null);
  const phoneScreenMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const glassRef = useRef<THREE.Mesh | null>(null);
  const spotLightRef = useRef<THREE.SpotLight | null>(null);

  // Scene state
  const isPhoneScreenActive = sceneId.includes('ch2') || Boolean(activeAction);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06080e);
    scene.fog = new THREE.FogExp2(0x06080e, 0.05);

    // 2. Camera (Perspective positioned at table edge looking toward partner)
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    // Player A and Player B sit on opposite sides of the table
    if (role === 'playerA') {
      camera.position.set(0, 2.2, 3.8);
      camera.lookAt(0, 0.7, 0);
    } else {
      camera.position.set(0, 2.2, -3.8);
      camera.lookAt(0, 0.7, 0);
    }

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // 4. Lights
    // Ambient light - deep intimate evening blue
    const ambientLight = new THREE.AmbientLight(0x182035, 1.2);
    scene.add(ambientLight);

    // Main Overhead Warm SpotLight over dining table
    const spotLight = new THREE.SpotLight(0xffecd2, 4.5);
    spotLight.position.set(0, 4.5, 0);
    spotLight.angle = Math.PI / 4.2;
    spotLight.penumbra = 0.8;
    spotLight.decay = 2;
    spotLight.distance = 12;
    spotLight.castShadow = true;
    spotLight.shadow.bias = -0.001;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    scene.add(spotLight);
    spotLightRef.current = spotLight;

    // Subtle candle / table rim light
    const candleLight = new THREE.PointLight(0xff9944, 1.8, 4);
    candleLight.position.set(-0.6, 1.1, 0);
    scene.add(candleLight);

    // 5. Dining Room & Environment
    // Polished dark wooden floor
    const floorGeo = new THREE.PlaneGeometry(16, 16);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0a0c12,
      roughness: 0.8,
      metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Dining Table (Centerpiece)
    const tableTopGeo = new THREE.BoxGeometry(2.2, 0.08, 1.3);
    const tableTopMat = new THREE.MeshStandardMaterial({
      color: 0x1f1610,
      roughness: 0.35,
      metalness: 0.15
    });
    const tableTop = new THREE.Mesh(tableTopGeo, tableTopMat);
    tableTop.position.set(0, 0.85, 0);
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    scene.add(tableTop);

    // Table Legs
    const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.85, 16);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.2 });
    [[-0.95, -0.5], [0.95, -0.5], [-0.95, 0.5], [0.95, 0.5]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(lx, 0.85 / 2, lz);
      leg.castShadow = true;
      scene.add(leg);
    });

    // Opposite Partner Chair Silhouette
    const chairBackGeo = new THREE.BoxGeometry(0.7, 0.8, 0.06);
    const chairMat = new THREE.MeshStandardMaterial({ color: 0x0d0f17, roughness: 0.9 });
    const chairZ = role === 'playerA' ? -1.1 : 1.1;
    const chair = new THREE.Mesh(chairBackGeo, chairMat);
    chair.position.set(0, 1.1, chairZ);
    chair.castShadow = true;
    scene.add(chair);

    // Partner Abstract Humanoid Silhouette / Aura across table
    const partnerAuraGeo = new THREE.CapsuleGeometry(0.3, 0.6, 8, 16);
    const partnerAuraMat = new THREE.MeshStandardMaterial({
      color: 0x141824,
      roughness: 0.8,
      transparent: true,
      opacity: 0.75
    });
    const partnerAura = new THREE.Mesh(partnerAuraGeo, partnerAuraMat);
    partnerAura.position.set(0, 1.35, chairZ * 0.95);
    scene.add(partnerAura);

    // 6. Interactive 3D Objects on Table
    // Raycasting click targets
    const interactableObjects: THREE.Object3D[] = [];

    // 📱 Smartphone 3D Model
    const phoneGroup = new THREE.Group();
    phoneGroup.position.set(0.25, 0.89 + 0.01, 0.15); // On top of table
    phoneGroup.name = 'spot_phone';

    // Phone Body
    const bodyGeo = new THREE.BoxGeometry(0.24, 0.015, 0.46);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a20,
      metalness: 0.9,
      roughness: 0.2
    });
    const phoneBody = new THREE.Mesh(bodyGeo, bodyMat);
    phoneBody.castShadow = true;
    phoneGroup.add(phoneBody);

    // Phone Screen Glass (Emissive glowing message)
    const screenGeo = new THREE.PlaneGeometry(0.21, 0.42);
    const screenMat = new THREE.MeshStandardMaterial({
      color: 0x050810,
      emissive: isPhoneScreenActive ? 0x2255aa : 0x050812,
      emissiveIntensity: isPhoneScreenActive ? 2.5 : 0.2,
      roughness: 0.1,
      metalness: 0.8
    });
    phoneScreenMatRef.current = screenMat;
    const phoneScreen = new THREE.Mesh(screenGeo, screenMat);
    phoneScreen.rotation.x = -Math.PI / 2;
    phoneScreen.position.y = 0.009;
    phoneGroup.add(phoneScreen);

    // Phone Screen Light source illuminating nearby table
    const phoneLight = new THREE.PointLight(0x38bdf8, isPhoneScreenActive ? 2.8 : 0, 1.4);
    phoneLight.position.set(0, 0.12, 0);
    phoneGroup.add(phoneLight);
    phoneScreenLightRef.current = phoneLight;

    // Small camera bezel
    const cameraBezelGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.005, 12);
    const cameraBezelMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const cam = new THREE.Mesh(cameraBezelGeo, cameraBezelMat);
    cam.position.set(0, 0.01, -0.18);
    phoneGroup.add(cam);

    phoneGroup.rotation.y = 0.18; // Slightly angled on table
    scene.add(phoneGroup);
    phoneRef.current = phoneGroup;
    interactableObjects.push(phoneGroup);

    // 🍷 Drink Glasses on table
    const glassGeo = new THREE.CylinderGeometry(0.06, 0.045, 0.22, 24);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.92,
      opacity: 1,
      transparent: true,
      roughness: 0.05,
      ior: 1.5,
      thickness: 0.15
    });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.set(-0.45, 0.89 + 0.11, 0.2);
    glass.castShadow = true;
    glass.name = 'spot_drink';
    scene.add(glass);
    glassRef.current = glass;
    interactableObjects.push(glass);

    // Partner's glass across table
    const partnerGlass = new THREE.Mesh(glassGeo, glassMat);
    partnerGlass.position.set(0.4, 0.89 + 0.11, -0.25);
    scene.add(partnerGlass);

    // Partner Eye-contact Area (Invisible hitbox above chair)
    const eyesHitboxGeo = new THREE.SphereGeometry(0.28, 16, 16);
    const eyesHitboxMat = new THREE.MeshBasicMaterial({ visible: false });
    const eyesHitbox = new THREE.Mesh(eyesHitboxGeo, eyesHitboxMat);
    eyesHitbox.position.set(0, 1.45, chairZ * 0.95);
    eyesHitbox.name = 'spot_partner_eyes';
    scene.add(eyesHitbox);
    interactableObjects.push(eyesHitbox);

    // 7. Raycasting & Mouse Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-100, -100);

    const onPointerMove = (e: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Parallax camera sway
      if (role === 'playerA') {
        camera.position.x = mouse.x * 0.35;
        camera.position.y = 2.2 + mouse.y * 0.2;
      } else {
        camera.position.x = -mouse.x * 0.35;
        camera.position.y = 2.2 + mouse.y * 0.2;
      }
      camera.lookAt(0, 0.8, 0);

      // Raycast hover check
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactableObjects, true);

      if (intersects.length > 0) {
        let topObj: THREE.Object3D | null = intersects[0].object;
        while (topObj && topObj.parent && topObj.parent !== scene) {
          if (topObj.name && topObj.name.startsWith('spot_')) break;
          topObj = topObj.parent;
        }

        const spotName = topObj?.name;
        if (spotName === 'spot_phone') {
          setHoveredName(locale === 'th' ? 'โทรศัพท์ของอีกฝ่าย (คลิกเพื่อตอบโต้)' : 'Partner Phone (Click to interact)');
          document.body.style.cursor = 'pointer';
        } else if (spotName === 'spot_drink') {
          setHoveredName(locale === 'th' ? 'แก้วน้ำบนโต๊ะ (จิบน้ำคลายเครียด)' : 'Drink glass on table');
          document.body.style.cursor = 'pointer';
        } else if (spotName === 'spot_partner_eyes') {
          setHoveredName(locale === 'th' ? 'สบตากับอีกฝ่ายตรงๆ' : 'Look into partner eyes');
          document.body.style.cursor = 'pointer';
        }
      } else {
        setHoveredName(null);
        document.body.style.cursor = 'default';
      }
    };

    const onPointerDown = (e: MouseEvent) => {
      if (hasChosen) return;
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactableObjects, true);

      if (intersects.length > 0) {
        let topObj: THREE.Object3D | null = intersects[0].object;
        while (topObj && topObj.parent && topObj.parent !== scene) {
          if (topObj.name && topObj.name.startsWith('spot_')) break;
          topObj = topObj.parent;
        }

        const spotName = topObj?.name;
        if (spotName === 'spot_phone') {
          sound.playConfirm();
          // Find matching hotspot action
          const matching = hotspots.find(h => h.type === 'phone' || h.id.includes('phone'));
          if (matching) {
            onSelectAction(matching.actionChoiceId);
          } else if (role === 'playerA') {
            onSelectAction('a_peek_phone');
          } else {
            onSelectAction('b_hurry_hide');
          }
        } else if (spotName === 'spot_partner_eyes') {
          sound.playConfirm();
          const matching = hotspots.find(h => h.type === 'partner_eyes');
          if (matching) {
            onSelectAction(matching.actionChoiceId);
          } else if (role === 'playerA') {
            onSelectAction('a_ask_gently');
          } else {
            onSelectAction('b_open_up');
          }
        } else if (spotName === 'spot_drink') {
          sound.playClick();
          const matching = hotspots.find(h => h.type === 'drinks' || h.type === 'item');
          if (matching) {
            onSelectAction(matching.actionChoiceId);
          } else if (role === 'playerA') {
            onSelectAction('a_give_space');
          } else {
            onSelectAction('b_deflect_smile');
          }
        }
      }
    };

    const container = mountRef.current;
    container.addEventListener('mousemove', onPointerMove);
    container.addEventListener('click', onPointerDown);

    // 8. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Subtle phone vibration animation if active
      if (phoneRef.current && (isPhoneScreenActive || activeAction)) {
        phoneRef.current.position.x = 0.25 + Math.sin(elapsedTime * 45) * 0.002;
        phoneRef.current.position.z = 0.15 + Math.cos(elapsedTime * 45) * 0.002;

        if (phoneScreenLightRef.current) {
          phoneScreenLightRef.current.intensity = 2.0 + Math.sin(elapsedTime * 8) * 1.2;
        }
      }

      // Gentle candle flicker
      candleLight.intensity = 1.6 + Math.sin(elapsedTime * 7) * 0.3;

      renderer.render(scene, camera);
    };
    animate();

    // 9. Resize Handling
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', onPointerMove);
      container.removeEventListener('click', onPointerDown);
      document.body.style.cursor = 'default';
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [role, sceneId, isPhoneScreenActive, hasChosen, locale]);

  return (
    <div className="relative w-full h-[55vh] min-h-[380px] max-h-[580px] rounded-3xl overflow-hidden border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.85)] bg-[#06080e] select-none">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-radial-vignette opacity-85" />

      {/* 3D Hover Tooltip */}
      {hoveredName && !hasChosen && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-fade-in">
          <div className="px-4 py-2 rounded-xl bg-black/80 backdrop-blur-md border border-rose-500/40 text-xs font-mono text-rose-200 shadow-xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            {hoveredName}
          </div>
        </div>
      )}

      {/* Real-time Reaction Alert Toast */}
      {activeAction && (
        <div className="absolute top-4 inset-x-4 md:inset-x-8 z-30 animate-fade-in pointer-events-none">
          <div className="bg-rose-950/90 border border-rose-500/50 backdrop-blur-xl px-4 py-3 rounded-2xl shadow-[0_10px_30px_rgba(244,63,94,0.4)] flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/25 text-rose-300 animate-pulse">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-mono uppercase tracking-wider text-rose-400">
                {locale === 'th' ? 'ปฏิกิริยาสด 3D' : 'LIVE 3D REACTION'}
              </p>
              <p className="text-sm font-thai text-slate-100 font-medium truncate">
                {locale === 'th' ? activeAction.actionLabelTh : activeAction.actionLabelEn}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Controls & 3D Badge */}
      <div className="absolute bottom-3 left-4 z-20 pointer-events-none flex items-center gap-2">
        <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[10px] text-slate-300 font-mono flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          FULL 3D WEBGL (THREE.JS)
        </span>
        {!hasChosen && (
          <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 backdrop-blur-md border border-rose-500/30 text-[10px] text-rose-300 font-mono animate-pulse">
            {locale === 'th' ? 'คลิกที่โทรศัพท์หรือวัตถุบนโต๊ะ 3D เพื่อตัดสินใจ' : 'Click 3D objects on table'}
          </span>
        )}
      </div>
    </div>
  );
};
