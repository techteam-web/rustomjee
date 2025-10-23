// FloorComparisonPanel.jsx
import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

export default function FloorComparisonPanel({ 
  show, 
  onClose, 
  floors, 
  lockedFloor = null 
}) {
  const [selectedFloorsByType, setSelectedFloorsByType] = useState({});
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const [hoveredFloor, setHoveredFloor] = useState(null);
  const svgRef = useRef(null);

  useEffect(() => {
    if (show && lockedFloor) {
      setSelectedFloorsByType({
        [lockedFloor.info.bhk]: lockedFloor
      });
    } else if (show && !lockedFloor) {
      setSelectedFloorsByType({});
    }
  }, [show, lockedFloor]);

  const getOppositeType = (type) => {
    return type === 'Duplex' ? 'Duplex-R' : 'Duplex';
  };

  const getClassColor = useCallback((floor) => {
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
    return classColors[floor.class] || '#d0aa2d';
  }, []);

  const handleFloorToggle = (floor) => {
    if (lockedFloor && floor.path_id === lockedFloor.id) {
      return;
    }

    const apartmentType = floor.bhk || 'Duplex';
    
    setSelectedFloorsByType(prev => {
      const newState = { ...prev };
      
      if (lockedFloor) {
        newState[lockedFloor.info.bhk] = lockedFloor;
      }

      const floorData = {
        id: floor.path_id,
        d: floor.d,
        info: {
          bhk: apartmentType,
          floorNumber: floor.floorNumber || 'XX',
          price: floor.price || 'XX Cr',
          area: floor.area || 'XXXX sq.ft',
          availability: floor.availability !== false
        }
      };
      
      if (newState[apartmentType]?.id === floor.path_id) {
        delete newState[apartmentType];
        return newState;
      }
      
      if (newState[apartmentType]) {
        newState[apartmentType] = floorData;
      } else {
        const currentTypes = Object.keys(newState);
        if (currentTypes.length < 2) {
          newState[apartmentType] = floorData;
        }
      }
      
      return newState;
    });
    
    if ('vibrate' in navigator) navigator.vibrate(30);
  };

  const removeApartmentType = (apartmentType) => {
    if (lockedFloor && apartmentType === lockedFloor.info.bhk) {
      return;
    }
    
    setSelectedFloorsByType(prev => {
      const newState = { ...prev };
      delete newState[apartmentType];
      return newState;
    });
  };

  const clearAllSelections = () => {
    if (lockedFloor) {
      setSelectedFloorsByType({
        [lockedFloor.info.bhk]: lockedFloor
      });
    } else {
      setSelectedFloorsByType({});
    }
  };

  const selectedFloorsArray = Object.values(selectedFloorsByType);

  const getFloorFillColor = useCallback((floor) => {
    const isSelected = selectedFloorsArray.some(f => f.id === floor.path_id);
    const isHovered = hoveredFloor === floor.path_id;
    const isLocked = lockedFloor && lockedFloor.id === floor.path_id;
    const apartmentType = floor.bhk || 'Duplex';

    if (isLocked) {
      return "rgba(29, 41, 56, 0.60)";
    }

    if (lockedFloor) {
      const oppositeType = getOppositeType(lockedFloor.info.bhk);
      
      if (apartmentType === oppositeType) {
        if (isSelected) {
          return "rgba(29, 41, 56, 0.60)";
        }
        if (isHovered) {
          return "rgba(59, 130, 246, 0.5)";
        }
        return "rgba(59, 130, 246, 0.3)";
      } else {
        return "rgba(0, 0, 0, 0.15)";
      }
    }

    if (isSelected) {
      return "rgba(29, 41, 56, 0.60)";
    }

    if (isHovered) {
      return getClassColor(floor);
    }

    return "rgba(0, 0, 0, 0.1)";
  }, [selectedFloorsArray, hoveredFloor, lockedFloor, getClassColor, getOppositeType]);

  const getFloorOpacity = useCallback((floor) => {
    const isSelected = selectedFloorsArray.some(f => f.id === floor.path_id);
    const isHovered = hoveredFloor === floor.path_id;
    return isSelected || isHovered ? 0.9 : 1;
  }, [selectedFloorsArray, hoveredFloor]);

  const getFloorPlanImages = (apartmentType) => {
    const floorPlans = {
      'Duplex': ['/images/floorplan.jpeg', '/images/floorplan.jpeg'],
      'Duplex-R': ['/images/floorplan.jpeg', '/images/floorplan.jpeg']
    };
    return floorPlans[apartmentType] || ['/images/floorplan.jpeg'];
  };

  if (!show) return null;

  const selectedTypes = Object.keys(selectedFloorsByType);
  const hasSelections = selectedTypes.length > 0;

 return createPortal(
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-[#FFFBF5] w-full h-full overflow-hidden flex">
      
      {/* Close Button with Purple accent */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-[#C7BED6] hover:bg-[#B0A5C5] rounded-full transition-colors cursor-pointer"
      >
        <svg 
          className="w-6 h-6 text-white"
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

      {/* Left Panel - Floor Plan Comparison */}
      <div className="w-2/3 bg-white overflow-y-auto">
        <div className="p-6 h-full flex flex-col">
          
          <div className="flex items-center justify-between mb-6 flex-shrink-0">
            <div>
              <h3 className="text-3xl font-bold text-[#000000]">Floor Plan Comparison</h3>
              {lockedFloor && (
                <p className="text-sm text-[#3F3F41] mt-1">
                  Comparing with Floor {lockedFloor.info.floorNumber} - {lockedFloor.info.bhk}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-[#3F3F41]">
                {selectedTypes.length}/2 apartment types
              </span>
              {hasSelections && selectedTypes.length > 1 && (
                <button
                  onClick={clearAllSelections}
                  className="text-sm cursor-pointer text-[#FFB8A1] hover:text-[#FF9A7A] font-medium"
                >
                  {lockedFloor ? 'Reset' : 'Clear All'}
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 min-h-0">
            {hasSelections ? (
              <div className={`grid gap-6 h-full ${selectedTypes.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {selectedTypes.map((apartmentType, idx) => {
                  const floor = selectedFloorsByType[apartmentType];
                  const images = getFloorPlanImages(apartmentType);
                  const currentIndex = currentImageIndex[apartmentType] || 0;
                  const isLockedFloor = lockedFloor && lockedFloor.id === floor.id;
                  
                  // Alternate colors for each floor plan
                  const colorSchemes = [
                    { border: '#C4E0FD', bg: '#E8F4FE', text: '#1E5A8E', badge: '#C4E0FD' }, // Blue
                    { border: '#BDD1B1', bg: '#E8F3E3', text: '#2D5016', badge: '#BDD1B1' }  // Green
                  ];
                  const scheme = colorSchemes[idx % 2];
                  
                  return (
                    <div key={apartmentType} className="bg-[#FFFBF5] rounded-lg shadow-sm relative overflow-hidden flex flex-col border-2" style={{ borderColor: isLockedFloor ? '#C19A40' : scheme.border }}>
                      
                      {!isLockedFloor && (
                        <button
                          onClick={() => removeApartmentType(apartmentType)}
                          className="absolute top-3 right-3 w-8 h-8 bg-white hover:bg-gray-100 rounded-full shadow-md cursor-pointer z-10 flex items-center justify-center"
                        >
                          <svg className="w-5 h-5 text-[#FFB8A1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}

                      <div className="p-4 border-b-2" style={{ 
                        backgroundColor: isLockedFloor ? '#FFE8CC' : scheme.bg,
                        borderColor: isLockedFloor ? '#C19A40' : scheme.border
                      }}>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-2xl uppercase" style={{ color: isLockedFloor ? '#C19A40' : scheme.text }}>
                            {apartmentType}
                          </h4>
                          {isLockedFloor && (
                            <span className="text-xs bg-[#C19A40] text-white px-2 py-1 rounded-full">Selected</span>
                          )}
                        </div>
                        <p className="text-sm text-[#3F3F41] mt-1">Floor {floor.info.floorNumber}</p>
                        <div className="flex items-center justify-between mt-3 text-sm text-[#3F3F41]">
                          <span className="font-medium">{floor.info.price}</span>
                          <span>{floor.info.area}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            floor.info.availability ? 'bg-[#BDD1B1] text-[#2D5016]' : 'bg-[#FFB8A1] text-[#7D2818]'
                          }`}>
                            {floor.info.availability ? 'Available' : 'Sold'}
                          </span>
                        </div>
                      </div>

                      <div className="relative bg-white flex-1 min-h-0">
                        <img
                          src={images[currentIndex]}
                          alt={`${apartmentType} Floor Plan`}
                          className="w-full h-full object-contain p-4"
                        />
                        
                        {images.length > 1 && (
                          <>
                            <button
                              onClick={() => setCurrentImageIndex(prev => ({
                                ...prev,
                                [apartmentType]: currentIndex > 0 ? currentIndex - 1 : images.length - 1
                              }))}
                              className="absolute left-3 top-1/2 -translate-y-1/2 hover:bg-white w-10 h-10 rounded-full shadow-lg cursor-pointer flex items-center justify-center"
                              style={{ backgroundColor: scheme.badge + 'E6', color: scheme.text }}
                            >
                              <span className="text-2xl">‹</span>
                            </button>
                            
                            <button
                              onClick={() => setCurrentImageIndex(prev => ({
                                ...prev,
                                [apartmentType]: currentIndex < images.length - 1 ? currentIndex + 1 : 0
                              }))}
                              className="absolute right-3 top-1/2 -translate-y-1/2 hover:bg-white w-10 h-10 rounded-full shadow-lg cursor-pointer flex items-center justify-center"
                              style={{ backgroundColor: scheme.badge + 'E6', color: scheme.text }}
                            >
                              <span className="text-2xl">›</span>
                            </button>
                            
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 px-3 py-2 rounded-full" style={{ backgroundColor: scheme.badge + '40' }}>
                              {images.map((_, index) => (
                                <button
                                  key={index}
                                  onClick={() => setCurrentImageIndex(prev => ({
                                    ...prev,
                                    [apartmentType]: index
                                  }))}
                                  className={`h-2 rounded-full transition-all cursor-pointer ${
                                    index === currentIndex ? 'w-6' : 'w-2'
                                  }`}
                                  style={{ backgroundColor: index === currentIndex ? scheme.text : scheme.text + '60' }}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center bg-[#E8F4FE] rounded-lg border-2 border-[#C4E0FD]">
                <div className="bg-white p-8 rounded-lg shadow-sm">
                  <h4 className="text-xl font-semibold text-[#000000] mb-2">
                    {lockedFloor ? 'Select Another Floor to Compare' : 'Select Floors from Building'}
                  </h4>
                  <p className="text-[#3F3F41] max-w-md">
                    {lockedFloor 
                      ? 'Click on a floor in the building view to compare floor plans.'
                      : 'Use the building visualization to select floors for comparison.'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Building SVG with gradient background */}
      <div className="w-1/3 p-6 flex flex-col items-center" style={{
        background: 'linear-gradient(180deg, #C8A468 0%, #BDD1B1 100%)'
      }}>
        <div className="mb-4 w-full bg-white/90 backdrop-blur-sm p-4 rounded-lg">
          <h4 className="text-lg font-bold text-[#000000]">Select Floors</h4>
          <p className="text-sm text-[#3F3F41]">Click on floors to compare</p>
        </div>

        <div className="flex-1 flex items-center justify-center w-full">
          <div className="relative w-full overflow-hidden rounded-lg shadow-xl border-2 border-white" style={{ aspectRatio: '9/16', maxHeight: '100%' }}>
            <svg
              ref={svgRef}
              viewBox="0 0 6826 3840"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
              preserveAspectRatio="xMidYMid slice"
              style={{ shapeRendering: 'optimizeSpeed', pointerEvents: 'auto', transform: 'translateY(-15%)' }}
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
                {floors.map((floor) => (
                  <path
                    key={floor.path_id}
                    id={floor.path_id}
                    d={floor.d}
                    fill={getFloorFillColor(floor)}
                    stroke="none"
                    strokeWidth="0"
                    opacity={getFloorOpacity(floor)}
                    style={{
                      cursor: 'pointer',
                      transition: 'opacity 120ms ease-out, fill 120ms ease-out',
                    }}
                    onMouseEnter={() => setHoveredFloor(floor.path_id)}
                    onMouseLeave={() => setHoveredFloor(null)}
                    onClick={() => handleFloorToggle(floor)}
                  />
                ))}
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>,
  document.body
);

}
