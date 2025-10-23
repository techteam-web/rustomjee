import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const Home = () => {
   const videoRef = useRef(null);
   const video2Ref = useRef(null);
    const container = useRef(null);
    const [scrollEnabled, setScrollEnabled] = useState(false);
    const [midSectionAnimComplete, setMidSectionAnimComplete] = useState(false);

    useGSAP(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(err => {
                console.log("Video autoplay prevented", err);
            });
        }

        // Disable scroll initially
        document.body.style.overflow = 'hidden';

        const logo = container.current?.querySelector('.logo img');
        const text1 = container.current?.querySelector('.text-1');
        const text2 = container.current?.querySelector('.text-2');
        const scrollIndicator = container.current?.querySelector('.scroll-indicator');

        if (!text1 || !text2 || !scrollIndicator) {
            return;
        }

        // Create sequential timeline
        const tl = gsap.timeline({
            onComplete: () => {
                // Enable scroll when animation completes
                document.body.style.overflow = 'auto';
                setScrollEnabled(true);
                
                // Play second video when scrolling is enabled
                if (video2Ref.current) {
                    video2Ref.current.play().catch(err => {
                        console.log("Video 2 autoplay prevented", err);
                    });
                }
            }
        });

        // Logo fade in
        tl.fromTo(logo,
            { opacity: 0 },
            { opacity: 1, duration: 1, ease: "power1.inOut" }
        )
        // First text - fade in
        .fromTo(text1,
            { opacity: 0 },
            { opacity: 1, duration: 0.8, ease: "power1.inOut" },
            "+=0.3"
        )
        // First text - fade out
        .to(text1,
            { opacity: 0, duration: 0.8, ease: "power1.inOut" },
            "+=1"
        )
        // Second text - fade in
        .fromTo(text2,
            { opacity: 0 },
            { opacity: 1, duration: 0.8, ease: "power1.inOut" },
            "+=0.2"
        )
        // Second text - fade out
        .to(text2,
            { opacity: 0, duration: 0.8, ease: "power1.inOut" },
            "+=1"
        )
        // Scroll indicator - fade in and stays
        .fromTo(scrollIndicator,
            { opacity: 0 },
            { opacity: 1, duration: 0.8, ease: "power1.inOut" },
            "+=0.2"
        );

    }, { scope: container });

    // Mid section animation - wait for DOM to be ready
    useEffect(() => {
        if (!scrollEnabled) return;

        const timer = setTimeout(() => {
            const midText = document.querySelector('.mid-text');
            if (!midText) return;

            // Create animation timeline
            const midTl = gsap.timeline({
                paused: true,
                onComplete: () => {
                    setMidSectionAnimComplete(true);
                }
            });

            midTl.fromTo(midText,
                { opacity: 0 },
                { opacity: 1, duration: 1, ease: "power1.inOut" }
            );

            // Create ScrollTrigger
            ScrollTrigger.create({
                trigger: '#mid-section',
                start: 'top center',
                onEnter: () => {
                    midTl.play();
                },
                once: true
            });

            ScrollTrigger.refresh();
        }, 100);

        return () => clearTimeout(timer);
    }, [scrollEnabled]);

    // End section animation
    useEffect(() => {
        if (!scrollEnabled || !midSectionAnimComplete) return;

        const timer = setTimeout(() => {
            const endLogo = document.querySelector('.end-logo');
            const endText = document.querySelector('.end-text');
            const endImage = document.querySelector('.end-image');
            const endTopLogo = document.querySelector('.end-top-logo');
            const endTopText = document.querySelector('.end-top-text');

            if (!endLogo || !endText || !endImage || !endTopLogo || !endTopText) return;

            // Create timeline
            const endTl = gsap.timeline({ paused: true });

            // Logo and text fade in (center)
            endTl.fromTo(endLogo,
                { opacity: 0 },
                { opacity: 1, duration: 1, ease: "power1.inOut" }
            )
            .fromTo(endText,
                { opacity: 0 },
                { opacity: 1, duration: 0.8, ease: "power1.inOut" },
                "-=0.5"
            )
            // Wait a bit
            .to({}, { duration: 1 })
            // Fade out center logo and text
            .to([endLogo, endText],
                { opacity: 0, duration: 0.8, ease: "power1.inOut" }
            )
            // Start zoom in image
            .fromTo(endImage,
                { scale: 1 },
                { scale: 1.1, duration: 2, ease: "power2.inOut" },
                "-=0.3"
            )
            // Fade in top logo and text during zoom
            .fromTo([endTopLogo, endTopText],
                { opacity: 0 },
                { opacity: 1, duration: 0.8, ease: "power1.inOut" },
                "-=1.5"
            );

            ScrollTrigger.create({
                trigger: '#end-section',
                start: 'top center',
                onEnter: () => {
                    endTl.play();
                },
                once: true
            });

            ScrollTrigger.refresh();
        }, 100);

        return () => clearTimeout(timer);
    }, [scrollEnabled, midSectionAnimComplete]);

    // Add scroll snap CSS
    useEffect(() => {
        if (scrollEnabled) {
            document.documentElement.style.scrollSnapType = 'y mandatory';
            document.documentElement.style.scrollBehavior = 'smooth';
        }
        
        return () => {
            document.documentElement.style.scrollSnapType = '';
            document.documentElement.style.scrollBehavior = '';
        };
    }, [scrollEnabled]);

    return (
        <div ref={container} className="no-scrollbar">
            {/* Hero Section */}
             <section id="hero-section" className="snap-section relative w-full h-[100vh] overflow-hidden">
                
                <video 
                    ref={videoRef} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="absolute top-0 left-0 w-full h-full object-cover -z-10"
                >
                    <source src="/video/5.mp4" type="video/mp4"/>
                </video>

                {/* Logo - Fixed within hero section */}
                <div className="logo absolute top-6 left-1/2 -translate-x-1/2 z-50">
                    <img 
                        src="/images/logo.svg" 
                        alt="Rustomjee" 
                        className="h-16 w-auto opacity-0"
                    />
                </div>

                {/* Sequential Text at Bottom */}
                <div className="absolute bottom-20 left-0 right-0 flex justify-center">
                    <h1 
                        className="text-1 absolute text-3xl md:text-4xl uppercase font-bold text-center px-8 opacity-0"
                        style={{ fontFamily: 'Balgin, sans-serif', color: 'white' }}
                    >
                        A quiet statement perched above the tides of time.
                    </h1>
                    
                    <h1 
                        className="text-2 absolute text-3xl md:text-4xl uppercase font-bold text-center px-8 opacity-0"
                        style={{ fontFamily: 'Balgin, sans-serif', color: 'white' }}
                    >
                        Where the sea tells its secrets
                    </h1>
                    
                    <div 
                        className="scroll-indicator absolute flex flex-col items-center opacity-0"
                    >
                        <p 
                            className="text-3xl md:text-4xl uppercase font-bold mb-1"
                            style={{ fontFamily: 'Balgin, sans-serif', color: 'white' }}
                        >
                            Scroll
                        </p>
                        <div className="flex flex-col -space-y-3">
                            <svg className="w-10 h-10" fill="white" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            <svg className="w-10 h-10" fill="white" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Top half of overlay at bottom of hero section */}
                {scrollEnabled && (
                    <div className="absolute bottom-0 left-0 w-full pointer-events-none z-30" style={{ height: '30vh' }}>
                        <img 
                            src="/images/overlay.png" 
                            alt="Overlay Top" 
                            className="w-full h-full"
                            style={{
                                objectFit: 'cover',
                                objectPosition: 'top'
                            }}
                        />
                    </div>
                )}
             
            </section>

            {/* Mid Section */}
            { scrollEnabled && (
                <><section id="mid-section" className="snap-section relative w-full h-[100vh] overflow-hidden">
                
                <video 
                    ref={video2Ref}
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="absolute top-0 left-0 w-full h-full object-cover -z-10"
                >
                    <source src="/video/2.mp4" type="video/mp4"/>
                </video>

                {/* Top half of overlay at top of mid section */}
                <div className="absolute top-0 left-0 w-full pointer-events-none z-30" style={{ height: '30vh' }}>
                    <img 
                        src="/images/overlay.png" 
                        alt="Overlay Top" 
                        className="w-full h-full"
                        style={{
                            objectFit: 'cover',
                            objectPosition: 'top'
                        }}
                    />
                </div>

                {/* Bottom half of overlay at bottom of mid section */}
                <div className="absolute bottom-0 left-0 w-full pointer-events-none z-30" style={{ height: '30vh' }}>
                    <img 
                        src="/images/overlay.png" 
                        alt="Overlay Bottom" 
                        className="w-full h-full"
                        style={{
                            objectFit: 'cover',
                            objectPosition: 'bottom'
                        }}
                    />
                </div>

                {/* Text on Left Side - Vertically Centered */}
                <div className="mid-text absolute left-8 md:left-16 top-1/2 -translate-y-1/2 z-40 opacity-0">
                    <h1 
                        className="text-5xl md:text-6xl uppercase font-bold"
                        style={{ 
                            fontFamily: 'Balgin, sans-serif', 
                            color: '#1d2938'
                        }}
                    >
                        A DREAM<br/>IN BANDRA
                    </h1>
                </div>
             
            </section>

            {/* End Section */}
             <section id="end-section" className="snap-section relative w-full h-[100vh] overflow-hidden">
                
                    <img
                    src="/images/building.webp" 
                    alt="Building" 
                    className="end-image absolute top-0 left-0 w-fit h-fit -z-10"
                    style={{ transformOrigin: 'center center' }}
                    />

                {/* Bottom half of overlay at top of end section */}
                <div className="absolute top-0 left-0 w-full pointer-events-none z-30" style={{ height: '30vh' }}>
                    <img 
                        src="/images/overlay.png" 
                        alt="Overlay Bottom" 
                        className="w-full h-full"
                        style={{
                            objectFit: 'cover',
                            objectPosition: 'bottom'
                        }}
                    />
                </div>

                {/* Logo and Text - Center (for intro animation) */}
                <div className="end-logo absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 opacity-0 flex flex-col items-center">
                    <img 
                        src="/images/logo.png" 
                        alt="Rustomjee" 
                        className="h-20 md:h-24 w-auto mb-4"
                    />
                    <h1 
                        className="end-text text-4xl md:text-5xl uppercase font-bold tracking-wider opacity-0"
                        style={{ 
                            fontFamily: 'Balgin, sans-serif', 
                            color: '#1d2938',
                            
                        }}
                    >
                        CLIFF TOWER
                    </h1>
                </div>

                {/* Logo and Text - Top (appears after zoom) */}
                <div className="end-top-logo absolute top-1 left-1/2 -translate-x-1/2 z-50 opacity-0 flex flex-col items-center">
                    <img 
                        src="/images/logo.png" 
                        alt="Rustomjee" 
                        className="h-12 md:h-14 w-auto mb-2"
                    />
                    <h1 
                        className="end-top-text text-xl md:text-2xl uppercase font-bold tracking-wider opacity-0"
                        style={{ 
                            fontFamily: 'Balgin, sans-serif', 
                            color: '#1d2938',
                            
                        }}
                    >
                        CLIFF TOWER
                    </h1>
                </div>
             
            </section>
            </>)}

        
        </div>
    );
};

export default Home;
