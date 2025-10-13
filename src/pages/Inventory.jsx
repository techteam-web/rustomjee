import { useState, useRef, useCallback, useEffect } from "react";
import { data } from "../constants/data";

// Modal Component
const LayerModal = ({ layer, onClose }) => {
  const modalRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
  <div ref={modalRef} className="relative max-w-4xl w-full mx-4">
    {/* Close Button - Positioned absolutely on top-right */}
    <button 
      onClick={onClose}
      className="absolute -top-0 -right-0 z-10 bg-transparent hover:bg-gray-100 rounded-full p-2 shadow-lg transition-colors cursor-pointer"
    >
      <svg 
        className="w-6 h-6 text-gray-700" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M6 18L18 6M6 6l12 12" 
        />
      </svg>
    </button>

    {/* Image */}
    <img 
      src="/images/floorplan.jpeg" 
      alt="Floor Plan"
      className="w-full h-auto rounded-lg shadow-2xl"
    />
  </div>
</div>

  );
};

export default function Inventory() {
  const [layers] = useState(data);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [hoveredLayer, setHoveredLayer] = useState(null);
  const [modalLayer, setModalLayer] = useState(null); // New state for modal
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
      // R204 G256 B252
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

  const handleLayerClick = useCallback((layer) => {
    // Check if layer has cls-1, cls-2, or cls-3
    if (['cls-1', 'cls-2', 'cls-3'].includes(layer.class)) {
      setModalLayer(layer); // Open modal
    }
    setSelectedLayer(prev => prev === layer.path_id ? null : layer.path_id);
  }, []);

  const closeModal = useCallback(() => {
    setModalLayer(null);
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

      {/* Render Modal */}
      {modalLayer && <LayerModal layer={modalLayer} onClose={closeModal} />}
    </div>
  );
}
