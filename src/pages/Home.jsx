import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const Home = () => {
    const videoRef = useRef(null);
    const container = useRef(null);

    useGSAP(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(err => {
                console.log("Video autoplay prevented", err);
            });
        }
        const logo = container.current?.querySelector('.logo img');
        const buildingName = container.current?.querySelector('.building-name');
        const taglines = container.current?.querySelectorAll('.tagline');
        

        if (!buildingName || !taglines.length ) {
            return;
        }

        // Hero animations
        const tl = gsap.timeline();

        tl.fromTo(logo,
            { opacity: 0, y: -20 },
            { opacity: 1, y: 0, duration: 0.8,ease: "power2.out" }
        )
        .fromTo(buildingName,
            { opacity: 0, y: 60 },
            { opacity: 1, y: 0, duration: 0.8,ease: "power2.out" }
        )
        .fromTo(taglines,
            { opacity: 0, x: -30 },
            { opacity: 1, x: 0, duration: 0.8, stagger: 0.3, ease: "power2.out" },
            "-=0.3"
        );

        // Gradient animation
       
       // Fade out video section

// Fade in white section




    }, { scope: container });

    return (
        <div ref={container}>
            {/* Hero Section */}
            <section id="hero-section" className="relative w-full h-[100vh] overflow-hidden">
                
                <video 
                    ref={videoRef} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="absolute top-0 left-0 w-full h-[120%] object-cover -z-10"
                >
                    <source src="/video/beach3.mp4" type="video/mp4"/>
                </video>

                {/* Logo - Fixed within hero section */}
                <div className="logo absolute top-6 left-1/2 -translate-x-1/2 z-50">
                    <img 
                        src="/images/logo.svg" 
                        alt="Rustomjee" 
                        className="h-16 w-auto opacity-0"
                    />
                </div>

                <div className="hero-text absolute inset-0 flex flex-col items-center justify-center px-8">
                    <h1 
                        className="building-name text-5xl md:text-6xl font-light tracking-wider mb-6 text-center opacity-0"
                        style={{ 
                            fontFamily: 'Balgin, sans-serif', 
                            color: 'white', 
                            textShadow: '2px 2px 4px rgba(0,0,0,0.5)' 
                        }}
                    >
                        RUSTOMJEE<br/>CLIFF TOWER 
                    </h1>

                    <div className="text-center space-y-2">
                        <p 
                            className="tagline text-base md:text-lg tracking-widest uppercase opacity-0"
                            style={{ 
                                fontFamily: 'Balgin, sans-serif', 
                                color: 'black', 
                                textShadow: '1px 1px 2px rgba(0,0,0,0.5)' 
                            }}
                        >
                            IT'S THOUGHTFUL.
                        </p>
                        <p 
                            className="tagline text-base md:text-lg tracking-widest uppercase opacity-0"
                            style={{ 
                                fontFamily: 'Balgin, sans-serif', 
                                color: 'black', 
                                textShadow: '1px 1px 2px rgba(0,0,0,0.5)' 
                            }}
                        >
                            IT'S RUSTOMJEE
                        </p>

                        <h1 className="text-4xl bottom-10 uppercase font-bold " style={{fontFamily:'Balgin, sans-serif'}}>Coming Soon</h1>
                    </div>
                    
                </div>
             
            </section>

        
        </div>
    );
};

export default Home;
