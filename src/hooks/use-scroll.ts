import { useEffect, useState } from "react";

// to track whether the user has scrolled past a certain vertical distance (threshold) on the page
export const useScroll = (threshold = 10) => {
    const [isScrolled, setIsScrolled] = useState(false);
    
    useEffect(()=>{
        const handleScroll = () => {
            setIsScrolled(window.scrollY > threshold);
        }

        window.addEventListener("scroll", handleScroll);

        handleScroll();

        return ()=> window.removeEventListener("scroll", handleScroll);
    }, [threshold])

    return isScrolled;
};