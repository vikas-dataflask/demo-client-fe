import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { generate3DStructure } from '../../utils/geometry';

const ThreeRenderer = ({ roomData, onObjectClick, selectedObjectId }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const objectsRef = useRef(new Map()); // Store references to 3D objects
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Camera setup
    const aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, aspect, 1, 100000);
    camera.position.set(50, 30, 50);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Grid helper
    const gridHelper = new THREE.GridHelper(100, 100, 0x888888, 0xcccccc);
    scene.add(gridHelper);

    // Axes helper
    const axesHelper = new THREE.AxesHelper(10);
    scene.add(axesHelper);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    setIsLoading(false);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Render 3D objects when room data changes
  useEffect(() => {
    if (!sceneRef.current || !roomData) return;

    // Clear existing objects
    objectsRef.current.forEach((object) => {
      sceneRef.current.remove(object);
    });
    objectsRef.current.clear();

    try {
      const structure3D = generate3DStructure(roomData.floor, roomData.rooms);
      renderFloor(structure3D.floor);
      structure3D.rooms.forEach(room => renderRoom(room));
    } catch (error) {
      console.error('Error rendering 3D scene:', error);
    }
  }, [roomData]);

  // Render floor slab
  const renderFloor = (floor) => {
    const floorGeometry = new THREE.BoxGeometry(
      floor.width / 1000, // Convert mm to meters
      floor.thickness / 1000,
      floor.height / 1000
    );
    
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xcccccc,
      roughness: 0.8,
      metalness: 0.1
    });
    
    const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
    floorMesh.position.set(
      floor.width / 2000, // Center the floor
      -floor.thickness / 2000,
      floor.height / 2000
    );
    floorMesh.receiveShadow = true;
    
    sceneRef.current.add(floorMesh);
    objectsRef.current.set('floor', floorMesh);
  };

  // Render room with walls
  const renderRoom = (room) => {
    // Generate walls for the room
    const walls = generateRoomWalls(room);
    
    walls.forEach(wall => {
      renderWall(wall, room.id);
    });

    // Render doors
    room.doors?.forEach(door => {
      renderDoor(door, room.id);
    });

    // Render windows
    room.windows?.forEach(window => {
      renderWindow(window, room.id);
    });
  };

  // Generate walls for a room
  const generateRoomWalls = (room) => {
    const { x, y, width, height, wallHeight = 3000, wallThickness = 200 } = room;
    
    // Convert to meters
    const xM = x / 1000;
    const yM = y / 1000;
    const widthM = width / 1000;
    const heightM = height / 1000;
    const wallHeightM = wallHeight / 1000;
    const wallThicknessM = wallThickness / 1000;
    
    return [
      // North wall (top)
      {
        id: `${room.id}-wall-north`,
        start: { x: xM, y: yM },
        end: { x: xM + widthM, y: yM },
        thickness: wallThicknessM,
        height: wallHeightM,
        type: 'Partition',
        material: 'Brick'
      },
      // East wall (right)
      {
        id: `${room.id}-wall-east`,
        start: { x: xM + widthM, y: yM },
        end: { x: xM + widthM, y: yM + heightM },
        thickness: wallThicknessM,
        height: wallHeightM,
        type: 'Partition',
        material: 'Brick'
      },
      // South wall (bottom)
      {
        id: `${room.id}-wall-south`,
        start: { x: xM + widthM, y: yM + heightM },
        end: { x: xM, y: yM + heightM },
        thickness: wallThicknessM,
        height: wallHeightM,
        type: 'Partition',
        material: 'Brick'
      },
      // West wall (left)
      {
        id: `${room.id}-wall-west`,
        start: { x: xM, y: yM + heightM },
        end: { x: xM, y: yM },
        thickness: wallThicknessM,
        height: wallHeightM,
        type: 'Partition',
        material: 'Brick'
      }
    ];
  };

  // Render individual wall
  const renderWall = (wall, roomId) => {
    const wallLength = Math.sqrt(
      Math.pow(wall.end.x - wall.start.x, 2) + 
      Math.pow(wall.end.y - wall.start.y, 2)
    );
    
    const wallGeometry = new THREE.BoxGeometry(
      wallLength,
      wall.height,
      wall.thickness
    );
    
    const wallMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xdcdcdc,
      roughness: 0.7,
      metalness: 0.1
    });
    
    const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
    
    // Position wall
    const centerX = (wall.start.x + wall.end.x) / 2;
    const centerZ = (wall.start.y + wall.end.y) / 2;
    wallMesh.position.set(centerX, wall.height / 2, centerZ);
    
    // Rotate wall to align with direction
    const angle = Math.atan2(wall.end.y - wall.start.y, wall.end.x - wall.start.x);
    wallMesh.rotation.y = angle;
    
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;
    
    // Add click handler
    wallMesh.userData = { 
      type: 'wall', 
      id: wall.id, 
      roomId: roomId 
    };
    
    sceneRef.current.add(wallMesh);
    objectsRef.current.set(wall.id, wallMesh);
  };

  // Render door
  const renderDoor = (door, roomId) => {
    const doorGeometry = new THREE.BoxGeometry(
      door.width / 1000,
      door.height / 1000,
      door.wallThickness / 1000 || 0.2
    );
    
    const doorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x704214,
      roughness: 0.6,
      metalness: 0.1
    });
    
    const doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);
    
    // Position door (this would need to be calculated based on wall position)
    doorMesh.position.set(
      door.x / 1000,
      door.height / 2000,
      door.y / 1000
    );
    
    doorMesh.castShadow = true;
    doorMesh.receiveShadow = true;
    
    // Add click handler
    doorMesh.userData = { 
      type: 'door', 
      id: door.id, 
      roomId: roomId 
    };
    
    sceneRef.current.add(doorMesh);
    objectsRef.current.set(door.id, doorMesh);
  };

  // Render window
  const renderWindow = (window, roomId) => {
    const windowGeometry = new THREE.BoxGeometry(
      window.width / 1000,
      window.height / 1000,
      window.wallThickness / 1000 || 0.1
    );
    
    const windowMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.7,
      roughness: 0.1,
      metalness: 0.9
    });
    
    const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
    
    // Position window
    windowMesh.position.set(
      window.x / 1000,
      window.sillHeight / 1000 + window.height / 2000,
      window.y / 1000
    );
    
    windowMesh.castShadow = true;
    windowMesh.receiveShadow = true;
    
    // Add click handler
    windowMesh.userData = { 
      type: 'window', 
      id: window.id, 
      roomId: roomId 
    };
    
    sceneRef.current.add(windowMesh);
    objectsRef.current.set(window.id, windowMesh);
  };

  // Handle mouse clicks
  useEffect(() => {
    if (!rendererRef.current || !cameraRef.current) return;

    const handleClick = (event) => {
      const mouse = new THREE.Vector2();
      mouse.x = (event.clientX / mountRef.current.clientWidth) * 2 - 1;
      mouse.y = -(event.clientY / mountRef.current.clientHeight) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);

      const intersects = raycaster.intersectObjects(sceneRef.current.children, true);

      if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        if (clickedObject.userData && onObjectClick) {
          onObjectClick(clickedObject.userData);
        }
      }
    };

    const canvas = rendererRef.current.domElement;
    canvas.addEventListener('click', handleClick);

    return () => {
      canvas.removeEventListener('click', handleClick);
    };
  }, [onObjectClick]);

  // Highlight selected object
  useEffect(() => {
    objectsRef.current.forEach((object, id) => {
      if (object.material) {
        if (id === selectedObjectId) {
          object.material.emissive.setHex(0x444444);
        } else {
          object.material.emissive.setHex(0x000000);
        }
      }
    });
  }, [selectedObjectId]);

  return (
    <div 
      ref={mountRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        position: 'relative'
      }}
    >
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#666',
          fontSize: '16px'
        }}>
          Loading 3D Scene...
        </div>
      )}
    </div>
  );
};

export default ThreeRenderer; 