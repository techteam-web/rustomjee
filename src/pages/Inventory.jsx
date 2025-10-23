// Inventory.jsx
import { useState, useRef, useCallback } from "react";
import { data } from "../constants/data";
import FloorComparisonPanel from "../components/FloorComparisonPanel";

export default function Inventory() {
  const [layers] = useState(data);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [hoveredLayer, setHoveredLayer] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [lockedFloor, setLockedFloor] = useState(null);
  const svgRef = useRef(null);

  const getClassColor = useCallback((layer) => {
    const classColors = {
      'cls-1': 'rgba(29, 41, 56, 0.60)',
      'cls-2': 'rgba(29, 41, 56, 0.60)',
      'cls-3': 'rgba(29, 41, 56, 0.60)',
      'cls-4': '#f3ea0b',
      'cls-5': '#f7ec13',
      'cls-6': '#f4ea11',
      'cls-7': 'rgba(181, 209, 141, 0.60)',
      'cls-8': '#3b4b9f',
      'cls-9': 'rgba(204, 256, 252, 0.60)',
    };
    return classColors[layer.class] || '#d0aa2d';
  }, []);

  const getFill = useCallback((layer) => {
    const active = selectedLayer === layer.path_id || hoveredLayer === layer.path_id;
    return active ? getClassColor(layer) : "rgba(0, 0, 0, 0.1)";
  }, [selectedLayer, hoveredLayer, getClassColor]);

  const getOpacity = useCallback((layer) => {
    const active = selectedLayer === layer.path_id || hoveredLayer === layer.path_id;
    return active ? 0.9 : 1;
  }, [selectedLayer, hoveredLayer]);

  const handleLayerMouseEnter = useCallback((pathId) => {
    setHoveredLayer(pathId);
  }, []);

  const handleLayerMouseLeave = useCallback(() => {
    setHoveredLayer(null);
  }, []);

  // ✅ UPDATED: Directly open comparison panel for highlighted floors
  const handleLayerClick = useCallback((layer) => {
    // Check if it's a highlighted floor (cls-1, cls-2, or cls-3)
    if (['cls-1', 'cls-2', 'cls-3'].includes(layer.class)) {
      // Convert layer to floor format
      const floor = {
        id: layer.path_id,
        d: layer.d,
        info: {
          bhk: layer.bhk || 'Duplex',
          floorNumber: layer.floorNumber || 'XX',
          price: layer.price || 'XX Cr',
          area: layer.area || 'XXXX sq.ft',
          availability: layer.availability !== false
        }
      };
      
      // Set as locked floor and open comparison
      setLockedFloor(floor);
      setShowComparison(true);
    }
    
    // Toggle selection for visual feedback
    setSelectedLayer(prev => prev === layer.path_id ? null : layer.path_id);
  }, []);

  const closeComparison = useCallback(() => {
    setShowComparison(false);
    setLockedFloor(null);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-[#dedbd4]">
      {/* Logo */}
      <div className="fixed top-4 right-10 z-40">
        <img 
          src="/images/logo.png" 
          alt="Logo" 
          className="w-16 h-16 sm:w-20 sm:h-20 md:w-30 md:h-30 object-contain" 
        />
      </div>

      {/* Building SVG */}
      <div className="fixed inset-0 w-full h-full flex items-center justify-center">
        <svg
          ref={svgRef}
          viewBox="0 0 6826 3840"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid slice"
          style={{ shapeRendering: 'optimizeSpeed', pointerEvents: 'auto' }}
        >
          <image
            href="/images/building.webp"
            x="0"
            y="0"
            width="6826"
            height="3840"
            preserveAspectRatio="xMidYMid slice"
          />

          <g style={{ transform: 'translate(2050px, -10px) scale(0.85)' }}>
            {layers.map((layer) => (
              <path
                key={layer.path_id}
                id={layer.path_id}
                d={layer.d}
                fill={getFill(layer)}          
                stroke="none"
                strokeWidth="0"
                opacity={getOpacity(layer)}      
                style={{
                  cursor: 'pointer',
                  transition: 'opacity 120ms ease-out, fill 120ms ease-out',
                }}
                onMouseEnter={() => handleLayerMouseEnter(layer.path_id)}
                onMouseLeave={handleLayerMouseLeave}
                onClick={() => handleLayerClick(layer)}
              />
            ))}
          </g>
        </svg>
      </div>

      {/* Comparison Panel */}
      {showComparison && (
        <FloorComparisonPanel
          show={showComparison}
          onClose={closeComparison}
          floors={data}
          lockedFloor={lockedFloor}
        />
      )}
    </div>
  );
}
