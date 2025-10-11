import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';

const CURSOR_SIZE = 120;
const LERP_FACTOR = 0.1;

export const ImageContainer = ({ baseImage, revealImage }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  
  const containerRef = useRef(null);
  const topImageRef = useRef(null);
  const bottomImageRef = useRef(null);
  const cursorIndicatorRef = useRef(null);

  const mousePos = useRef({ x: -CURSOR_SIZE, y: -CURSOR_SIZE });
  const animatedValues = useRef({
    x: -CURSOR_SIZE,
    y: -CURSOR_SIZE,
    size: 0,
    scale: 1,
    opacity: 0,
  });
  
  const animationFrameId = useRef(null);

  // Detect mobile/tablet based on screen size
  useEffect(() => {
    const checkScreenSize = () => {
      // Mobile and tablets are typically <= 1024px
      setIsMobileOrTablet(window.innerWidth <= 1024);
    };

    // Check on mount
    checkScreenSize();

    // Listen for window resize
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Desktop animation loop
  useEffect(() => {
    if (isMobileOrTablet) return;

    const animate = () => {
      if (isAnimating) {
        animationFrameId.current = requestAnimationFrame(animate);
        return;
      }

      const targetSize = isHovering ? CURSOR_SIZE : 0;
      const targetScale = isHovering ? 1.1 : 1;
      const targetOpacity = isHovering ? 1 : 0;

      const anim = animatedValues.current;

      anim.x += (mousePos.current.x - anim.x) * LERP_FACTOR;
      anim.y += (mousePos.current.y - anim.y) * LERP_FACTOR;
      anim.size += (targetSize - anim.size) * LERP_FACTOR;
      anim.scale += (targetScale - anim.scale) * LERP_FACTOR;
      anim.opacity += (targetOpacity - anim.opacity) * LERP_FACTOR;

      if (topImageRef.current && cursorIndicatorRef.current) {
        const revealRadius = anim.size / 2;
        topImageRef.current.style.clipPath = `circle(${revealRadius}px at ${anim.x}px ${anim.y}px)`;
        topImageRef.current.style.transform = `scale(${anim.scale})`;
        topImageRef.current.style.transformOrigin = `${anim.x}px ${anim.y}px`;

        cursorIndicatorRef.current.style.width = `${anim.size}px`;
        cursorIndicatorRef.current.style.height = `${anim.size}px`;
        cursorIndicatorRef.current.style.opacity = `${anim.opacity}`;
        cursorIndicatorRef.current.style.transform = `translate(${anim.x}px, ${anim.y}px) translate(-50%, -50%) scale(${anim.scale})`;
      }

      const isSettled = Math.abs(targetSize - anim.size) < 0.1;
      if (!isHovering && isSettled) {
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
          animationFrameId.current = null;
        }
      } else {
        animationFrameId.current = requestAnimationFrame(animate);
      }
    };
    
    if (!animationFrameId.current) {
      if (isHovering) {
        animatedValues.current.x = mousePos.current.x;
        animatedValues.current.y = mousePos.current.y;
      }
      animationFrameId.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    };
  }, [isHovering, isAnimating, isMobileOrTablet]);

  const handleMouseMove = (e) => {
    if (containerRef.current && !isAnimating && !isMobileOrTablet) {
      const rect = containerRef.current.getBoundingClientRect();
      mousePos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
    
    if (isAnimating || isMobileOrTablet) return;

    setIsAnimating(true);

    const rect = containerRef.current.getBoundingClientRect();
    const maxRadius = Math.sqrt(Math.pow(rect.width, 2) + Math.pow(rect.height, 2));
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    gsap.to(animatedValues.current, {
      size: maxRadius * 2,
      scale: 1,
      opacity: 1,
      duration: 0.8,
      ease: "power2.inOut",
      onUpdate: () => {
        if (topImageRef.current && cursorIndicatorRef.current) {
          const anim = animatedValues.current;
          const revealRadius = anim.size / 2;
          
          topImageRef.current.style.clipPath = `circle(${revealRadius}px at ${clickX}px ${clickY}px)`;
          topImageRef.current.style.transform = `scale(1)`;
          
          cursorIndicatorRef.current.style.width = `${anim.size}px`;
          cursorIndicatorRef.current.style.height = `${anim.size}px`;
          cursorIndicatorRef.current.style.opacity = `1`;
          cursorIndicatorRef.current.style.transform = `translate(${clickX}px, ${clickY}px) translate(-50%, -50%) scale(1)`;
        }
      },
      onComplete: () => {
        if (bottomImageRef.current && topImageRef.current) {
          const tempSrc = bottomImageRef.current.src;
          bottomImageRef.current.src = topImageRef.current.src;
          topImageRef.current.src = tempSrc;
        }
        
        animatedValues.current.size = 0;
        animatedValues.current.opacity = 0;
        animatedValues.current.x = mousePos.current.x;
        animatedValues.current.y = mousePos.current.y;
        
        if (topImageRef.current) {
          topImageRef.current.style.clipPath = `circle(0px at ${mousePos.current.x}px ${mousePos.current.y}px)`;
        }
        
        setIsAnimating(false);
      }
    });
  };

  const handleToggle = (e) => {
    e.stopPropagation();
    setShowReveal(!showReveal);
  };

  // Render for MOBILE/TABLET (screen width <= 1024px)
  if (isMobileOrTablet) {
    return (
      <div className="image-container-wrapper absolute top-0 left-0 w-full h-full z-[2]">
        <img
          src={showReveal ? revealImage : baseImage}
          alt="View"
          className="absolute top-0 left-0 w-full h-full object-cover select-none transition-opacity duration-500"
          draggable="false"
        />

        <button
          onClick={handleToggle}
          className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full p-3 sm:p-4 transition-all duration-300 group touch-manipulation"
          aria-label="Toggle day/night view"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:scale-110"
          >
            {showReveal ? (
              <>
                <circle cx="12" cy="12" r="5" fill="white" />
                <path
                  d="M12 1v3M12 20v3M1 12h3M20 12h3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </>
            ) : (
              <path
                d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                fill="white"
              />
            )}
          </svg>
        </button>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-xs sm:text-sm pointer-events-none">
          {showReveal ? 'Night View' : 'Day View'}
        </div>
      </div>
    );
  }

  // Render for DESKTOP/LAPTOP (screen width > 1024px)
  return (
    <div
      ref={containerRef}
      className="image-container-wrapper absolute top-0 left-0 w-full h-full cursor-none z-[2]"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => !isAnimating && setIsHovering(true)}
      onMouseLeave={() => !isAnimating && setIsHovering(false)}
      onClick={handleClick}
    >
      <img
        ref={bottomImageRef}
        src={baseImage}
        alt="Base"
        className="absolute top-0 left-0 w-full h-full object-cover select-none"
        draggable="false"
      />
      
      <img
        ref={topImageRef}
        src={revealImage}
        alt="Reveal"
        className="absolute top-0 left-0 w-full h-full object-cover select-none"
        style={{ willChange: 'clip-path, transform' }}
        draggable="false"
      />
      
      <div
        ref={cursorIndicatorRef}
        className="absolute top-0 left-0 pointer-events-none rounded-full border-2 border-white/70 shadow-[0_0_15px_rgba(255,255,255,0.5)]"
        style={{ willChange: 'transform, opacity, width, height' }}
        aria-hidden="true"
      />
    </div>
  );
};
