import { useRef, useState } from 'react';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { useGSAP } from '@gsap/react';
import { ImageContainer } from '../components/ImageContainer';
import { slidesData } from '../constants/data';

// Register plugins
gsap.registerPlugin(useGSAP, CustomEase);

// Create custom ease outside component (runs once)
CustomEase.create(
  "hop",
  "M0,0 C0.083,0.294 0.117,0.767 0.413,0.908 0.606,1 0.752,1 1,1 "
);

export default function StorySlider({ 
  slides = slidesData,
  duration = 2.0,
  throttleDelay = 500
}) {
  const containerRef = useRef();
  const animatingRef = useRef(false);
  const [currentCategory, setCurrentCategory] = useState('amenities');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Touch handling
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);
  const touchEndY = useRef(0);
  const touchEndX = useRef(0);
  const minSwipeDistance = 50;

  // Accumulated delta for touchpad
  const accumulatedDelta = useRef(0);
  const SCROLL_THRESHOLD = 100;

  // Calculate category boundaries
  const categorySlideCount = slides.reduce((acc, slide) => {
    acc[slide.category] = (acc[slide.category] || 0) + 1;
    return acc;
  }, {});

  const totalSlides = slides.length;
  
  const amenitiesWidth = (categorySlideCount.amenities / totalSlides) * 100;
  const apartmentWidth = (categorySlideCount.apartment / totalSlides) * 100;

  const overallProgress = ((currentSlideIndex + 1) / totalSlides) * 100;

  // Animate text elements when slide becomes active
  const animateTextElements = (slideElement) => {
    const heading = slideElement.querySelector('.text-heading');
    const text = slideElement.querySelector('.text-body');
    const subtext = slideElement.querySelector('.text-subtext');

    if (!heading) return;

    const tl = gsap.timeline({ delay: 0 });

    gsap.set([heading, text, subtext].filter(Boolean), {
      opacity: 0,
      y: 20,
    });

    tl.to(heading, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out",
    });

    if (text) {
      tl.to(text, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
      }, "-=0.3");
    }

    if (subtext) {
      tl.to(subtext, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
      }, "-=0.3");
    }
  };

  const { contextSafe } = useGSAP(
    () => {
      const slider = containerRef.current.querySelector('.slider');
      let slideElements = slider.querySelectorAll('.slide');

      slideElements.forEach((slide, index) => {
        if (index > 0) {
          gsap.set(slide, {
            clipPath: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
          });
        }
      });

      const firstSlide = slideElements[0];
      if (firstSlide.querySelector('.text-heading')) {
        animateTextElements(firstSlide);
      }

      const handleSliderNext = () => {
        if (animatingRef.current) return;
        animatingRef.current = true;

        slideElements = slider.querySelectorAll('.slide');

        const firstSlide = slideElements[0];
        const secondSlide = slideElements[1];

        if (slideElements.length > 1) {
          const nextCategory = secondSlide.getAttribute('data-category');
          const nextSlideIndex = parseInt(secondSlide.getAttribute('data-slide-index'));
          
          setCurrentCategory(nextCategory);
          setCurrentSlideIndex(nextSlideIndex);
          
          const firstAnimTarget = firstSlide.querySelector('.slide-content');
          const secondAnimTarget = secondSlide.querySelector('.slide-content');
          
          gsap.set(secondAnimTarget, { x: 250 });

          gsap.to(secondAnimTarget, {
            x: 0,
            duration: duration,
            ease: "hop",
          });

          gsap.to(firstAnimTarget, {
            x: -500,
            duration: duration,
            ease: "hop",
          });

          gsap.to(secondSlide, {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            duration: duration,
            ease: "hop",
            onUpdate: function() {
              const progress = this.progress();
              if (progress >= 0.33 && !secondSlide.dataset.textAnimated) {
                secondSlide.dataset.textAnimated = 'true';
                animateTextElements(secondSlide);
              }
            },
            onComplete: function () {
              firstSlide.remove();
              slider.appendChild(firstSlide);

              gsap.set(firstSlide, {
                clipPath: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
              });
              
              delete secondSlide.dataset.textAnimated;

              animatingRef.current = false;
            },
          });
        } else {
          animatingRef.current = false;
        }
      };

      const handleSliderPrev = () => {
        if (animatingRef.current) return;
        animatingRef.current = true;

        slideElements = slider.querySelectorAll('.slide');

        const lastSlide = slideElements[slideElements.length - 1];
        const currentSlide = slideElements[0];

        if (slideElements.length > 1) {
          const prevCategory = lastSlide.getAttribute('data-category');
          const prevSlideIndex = parseInt(lastSlide.getAttribute('data-slide-index'));
          
          setCurrentCategory(prevCategory);
          setCurrentSlideIndex(prevSlideIndex);
          
          const currentAnimTarget = currentSlide.querySelector('.slide-content');
          const lastAnimTarget = lastSlide.querySelector('.slide-content');
          
          slider.removeChild(lastSlide);
          slider.insertBefore(lastSlide, currentSlide);

          gsap.set(lastSlide, {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          });
          gsap.set(lastAnimTarget, { x: -500 });
          gsap.set(currentAnimTarget, { x: 0 });

          gsap.to(lastAnimTarget, {
            x: 0,
            duration: duration,
            ease: "hop",
          });

          gsap.to(currentAnimTarget, {
            x: 250,
            duration: duration,
            ease: "hop",
          });

          gsap.to(currentSlide, {
            clipPath: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
            duration: duration,
            ease: "hop",
            onUpdate: function() {
              const progress = this.progress();
              if (progress >= 0.33 && !lastSlide.dataset.textAnimated) {
                lastSlide.dataset.textAnimated = 'true';
                animateTextElements(lastSlide);
              }
            },
            onComplete: function () {
              gsap.set(currentAnimTarget, { x: 0 });
              delete lastSlide.dataset.textAnimated;
              animatingRef.current = false;
            },
          });
        } else {
          animatingRef.current = false;
        }
      };

      const handleWheel = contextSafe((event) => {
        if (animatingRef.current) {
          accumulatedDelta.current = 0;
          return;
        }

        const delta = event.deltaY;
        accumulatedDelta.current += delta;

        if (Math.abs(accumulatedDelta.current) >= SCROLL_THRESHOLD) {
          if (accumulatedDelta.current > 0) {
            handleSliderNext();
          } else {
            handleSliderPrev();
          }
          
          accumulatedDelta.current = 0;
        }
      });

      window.addEventListener("wheel", handleWheel, { passive: true });
      window.handleSliderNext = handleSliderNext;
      window.handleSliderPrev = handleSliderPrev;

      return () => {
        window.removeEventListener("wheel", handleWheel);
        delete window.handleSliderNext;
        delete window.handleSliderPrev;
      };
    },
    { scope: containerRef }
  );

  const handleTouchStart = (e) => {
    // Allow all touches to work for swiping
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndY.current = e.touches[0].clientY;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartY.current || !touchEndY.current) return;

    const deltaY = touchStartY.current - touchEndY.current;
    const deltaX = touchStartX.current - touchEndX.current;
    
    // Only trigger if it's a vertical swipe (not horizontal)
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      if (deltaY > minSwipeDistance) {
        if (window.handleSliderNext) {
          window.handleSliderNext();
        }
      }
      else if (deltaY < -minSwipeDistance) {
        if (window.handleSliderPrev) {
          window.handleSliderPrev();
        }
      }
    }

    touchStartY.current = 0;
    touchStartX.current = 0;
    touchEndY.current = 0;
    touchEndX.current = 0;
  };

  const jumpToCategory = contextSafe((category) => {
    if (animatingRef.current || currentCategory === category) return;
    
    const slider = containerRef.current.querySelector('.slider');
    const slideElements = Array.from(slider.querySelectorAll('.slide'));
    
    const targetIndex = slideElements.findIndex(
      slide => slide.getAttribute('data-category') === category
    );
    
    if (targetIndex === -1 || targetIndex === 0) return;
    
    const targetSlide = slideElements[targetIndex];
    const targetSlideIndex = parseInt(targetSlide.getAttribute('data-slide-index'));
    
    setCurrentCategory(category);
    setCurrentSlideIndex(targetSlideIndex);
    
    animatingRef.current = true;

    const currentSlide = slideElements[0];
    
    const currentAnimTarget = currentSlide.querySelector('.slide-content');
    const targetAnimTarget = targetSlide.querySelector('.slide-content');

    gsap.set(targetAnimTarget, { x: 250 });

    gsap.to(targetAnimTarget, {
      x: 0,
      duration: duration,
      ease: "hop",
    });

    gsap.to(currentAnimTarget, {
      x: -500,
      duration: duration,
      ease: "hop",
    });

    gsap.to(targetSlide, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      duration: duration,
      ease: "hop",
      onUpdate: function() {
        const progress = this.progress();
        if (progress >= 0.33 && !targetSlide.dataset.textAnimated) {
          targetSlide.dataset.textAnimated = 'true';
          animateTextElements(targetSlide);
        }
      },
      onComplete: function () {
        for (let i = 0; i < targetIndex; i++) {
          const slideToMove = slider.querySelector('.slide');
          slideToMove.remove();
          slider.appendChild(slideToMove);
          gsap.set(slideToMove, {
            clipPath: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
          });
        }

        delete targetSlide.dataset.textAnimated;
        animatingRef.current = false;
      },
    });
  });

  const renderSlideContent = (slide) => {
    if (slide.isPortrait) {
      return (
        <div className="slide-content absolute top-0 left-0 w-full h-full flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 h-1/2 md:h-full relative bg-black flex items-center justify-center">
            {slide.revealImage ? (
              <ImageContainer 
                baseImage={slide.src} 
                revealImage={slide.revealImage} 
              />
            ) : (
              <img
                src={slide.src}
                alt={`Slide ${slide.id}`}
                className="h-full w-auto object-contain"
              />
            )}
          </div>

          <div className="w-full md:w-1/2 h-1/2 md:h-full bg-black flex items-center justify-center p-8 md:p-12">
            <div className="max-w-md">
              <h2 className="text-heading text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6 opacity-0">
                {slide.heading || 'Elegant Spaces'}
              </h2>
              <p className="text-body text-base md:text-lg text-white leading-relaxed mb-4 opacity-0">
                {slide.text || 'Experience luxury living with thoughtfully designed interiors.'}
              </p>
              {slide.subtext && (
                <p className="text-subtext text-sm md:text-base text-gray-300 italic opacity-0">
                  {slide.subtext}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="slide-content absolute top-0 left-0 w-full h-full">
        {slide.revealImage ? (
          <ImageContainer 
            baseImage={slide.src} 
            revealImage={slide.revealImage} 
          />
        ) : (
          <img
            src={slide.src}
            alt={`Slide ${slide.id}`}
            className="absolute top-0 left-0 w-full h-full object-cover will-change-transform"
          />
        )}
      </div>
    );
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-screen h-screen bg-black overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className='fixed top-2 left-2 z-50 flex justify-end items-end p-4'>
        <a href="/"><img src="/images/logo.svg" alt="Rustomjee" className="h-12 w-auto"/></a>
      </div>

      <div className="slider absolute top-0 left-0 w-full h-full overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            data-category={slide.category}
            data-slide-index={index}
            className="slide absolute top-0 left-0 w-full h-full overflow-hidden will-change-transform"
          >
            {renderSlideContent(slide)}
          </div>
        ))}

        <div className='bottom-6 w-[90%] sm:w-[50%] px-4 sm:px-12 absolute left-1/2 -translate-x-1/2 z-50'>
          <div className='grid grid-cols-3 gap-2 sm:gap-6 mb-4'>
            <button 
              onClick={() => jumpToCategory('amenities')}
              className={`bg-transparent uppercase border-none cursor-pointer text-sm sm:text-xl text-white touch-manipulation ${currentCategory === 'amenities' ? 'font-bold' : ''}`}
            >
              Amenities
            </button>
            <button 
              onClick={() => jumpToCategory('apartment')}
              className={`bg-transparent uppercase border-none cursor-pointer text-sm sm:text-xl text-white touch-manipulation ${currentCategory === 'apartment' ? 'font-bold' : ''}`}
            >
              Apartment
            </button>
            <button 
              onClick={() => jumpToCategory('exterior')}
              className={`bg-transparent uppercase border-none cursor-pointer text-sm sm:text-xl text-white touch-manipulation ${currentCategory === 'exterior' ? 'font-bold' : ''}`}
            >
              Exterior
            </button>
          </div>

          <div className='relative w-full h-1 bg-white/30 rounded-none overflow-hidden opacity-50'>
            <div 
              className='absolute top-0 h-full w-[2px] bg-white/60 z-10'
              style={{ left: '0%' }}
            />
            <div 
              className='absolute top-0 h-full w-[2px] bg-white/60 z-10'
              style={{ left: `${amenitiesWidth}%` }}
            />
            <div 
              className='absolute top-0 h-full w-[2px] bg-white/60 z-10'
              style={{ left: `${amenitiesWidth + apartmentWidth}%` }}
            />
            
            <div 
              className='h-full bg-white transition-all duration-300 ease-out rounded-none'
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
