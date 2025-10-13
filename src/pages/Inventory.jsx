import { useState, useRef, useCallback } from "react";
import { data } from "../constants/data";

export default function Inventory() {
  const [layers] = useState(data);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [hoveredLayer, setHoveredLayer] = useState(null);
  const svgRef = useRef(null);

  // Map cls-* to highlight colors
  const getClassColor = useCallback((layer) => {
    const classColors = {
      'cls-1': 'rgba(139, 92, 246, 0.60)',
      'cls-2': 'rgba(139, 92, 246, 0.60)',
      'cls-3': 'rgba(139, 92, 246, 0.60)',
      'cls-4': '#f3ea0b',
      'cls-5': '#f7ec13',
      'cls-6': '#f4ea11',
      'cls-7': 'rgba(16, 185, 129, 0.60)',
      'cls-8': '#3b4b9f',
      'cls-9': 'rgba(135, 206, 235, 0.60)',
    };
    return classColors[layer.class] || '#d0aa2d';
  }, []);

  // Default neutral fill; highlight on hover/selection
  const getFill = useCallback((layer) => {
    const active = selectedLayer === layer.path_id || hoveredLayer === layer.path_id;
    return active ? getClassColor(layer) : "rgba(0, 0, 0, 0.1)";
  }, [selectedLayer, hoveredLayer, getClassColor]);

  // Stronger when active
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

  const handleLayerClick = useCallback((layer) => {
    setSelectedLayer(prev => prev === layer.path_id ? null : layer.path_id);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-[#dedbd4]">
      <div className="fixed top-4 right-10 z-40">
        <img 
          src="/images/logo.png" 
          alt="Logo" 
          className="w-16 h-16 sm:w-20 sm:h-20 md:w-30 md:h-30 object-contain" 
        />
      </div>

      {/* {hoveredLayer && (
        <div className="fixed top-4 left-4 z-40 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
          <p className="text-sm font-semibold">
            {layers.find(l => l.path_id === hoveredLayer)?.layer_id}
          </p>
          <p className="text-xs text-gray-600">
            {hoveredLayer}
          </p>
        </div>
      )} */}

      <div className="fixed inset-0 w-full h-full flex items-center justify-center">
        <svg
          ref={svgRef}
          viewBox="0 0 6826 3840"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid slice"
          style={{ shapeRendering: 'optimizeSpeed', pointerEvents: 'auto' }}
        >
          {/* Background Image */}
          <image
            href="/images/building.webp"
            x="0"
            y="0"
            width="6826"
            height="3840"
            preserveAspectRatio="xMidYMid slice"
          />

          {/* KEEPING your g transform exactly */}
          <g
  style={{
    transform: 'translate(2050px, -10px) scale(0.85) '
  }}
>
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
                  outline: selectedLayer === layer.path_id ? 'none' : 'none',
                }}
                onMouseEnter={() => handleLayerMouseEnter(layer.path_id)}
                onMouseLeave={handleLayerMouseLeave}
                onClick={() => handleLayerClick(layer)}
              />
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}
