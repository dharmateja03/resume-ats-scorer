import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import './ATSScoreGauge.css';

const ATSScoreGauge = ({ averageScore = 78 }) => {
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Setup
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Clear any existing canvas
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    
    // Create scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 5;
    
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true 
    });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0); // Transparent background
    container.appendChild(renderer.domElement);
    
    // Create simple ring
    const ringGeometry = new THREE.RingGeometry(1, 1.3, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xdddddd,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    scene.add(ring);
    
    // Create filled portion based on score
    const filledAngle = (averageScore / 100) * Math.PI * 2;
    const filledGeometry = new THREE.RingGeometry(1, 1.3, 32, 1, 0, filledAngle);
    
    // Color based on score
    let color = 0xF44336; // Red by default
    if (averageScore >= 80) {
      color = 0x4CAF50; // Green for high scores
    } else if (averageScore >= 60) {
      color = 0xFFC107; // Yellow for medium scores
    }
    
    const filledMaterial = new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide
    });
    const filledRing = new THREE.Mesh(filledGeometry, filledMaterial);
    filledRing.rotation.z = -Math.PI / 2; // Start from top
    scene.add(filledRing);
    
    // Add text element for the score
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 200;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#333333';
    context.font = 'bold 60px Arial';
    context.fillText(averageScore, 100, 100);
    
    const texture = new THREE.CanvasTexture(canvas);
    const textMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true
    });
    const textGeometry = new THREE.PlaneGeometry(1.5, 1.5);
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.z = 0.1;
    scene.add(textMesh);
    
    // Simple animation
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Gentle hover animation
      const time = Date.now() * 0.001;
      ring.rotation.x = Math.sin(time * 0.5) * 0.1;
      ring.rotation.y = Math.cos(time * 0.3) * 0.1;
      
      filledRing.rotation.x = ring.rotation.x;
      filledRing.rotation.y = ring.rotation.y;
      filledRing.rotation.z = -Math.PI / 2; // Keep the fill starting from top
      
      textMesh.rotation.x = ring.rotation.x;
      textMesh.rotation.y = ring.rotation.y;
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Handle resize
    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      ringGeometry.dispose();
      ringMaterial.dispose();
      filledGeometry.dispose();
      filledMaterial.dispose();
      textGeometry.dispose();
      textMaterial.dispose();
      texture.dispose();
    };
  }, [averageScore]);
  
  return (
    <div className="ats-gauge-container" ref={containerRef}>
      <div className="gauge-label">Average ATS Score</div>
    </div>
  );
};

export default ATSScoreGauge;