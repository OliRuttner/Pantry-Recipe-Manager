import { useEffect, useState } from "react";

const frames = [
    "/cookie/cookie_1.png",
    "/cookie/cookie_2.png",
    "/cookie/cookie_3.png",
    "/cookie/cookie_4.png",
    "/cookie/cookie_5.png",
    "/cookie/cookie_6.png",
];

export default function CookieScroll() {
    const [frameIndex, setFrameIndex] = useState(0);

    useEffect(() => {
        function handleScroll() {
            const maxScroll =
                document.documentElement.scrollHeight - window.innerHeight;

            if (maxScroll <= 0) {
                setFrameIndex(0);
                return;
            }

            const progress = window.scrollY / maxScroll;
            const index = Math.min(
                frames.length - 1,
                Math.floor(progress * frames.length)
            );

            setFrameIndex(index);
        }

        handleScroll();
        window.addEventListener("scroll", handleScroll);
        window.addEventListener("resize", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleScroll);
        };
    }, []);

    return (
        <img
            className="scroll-cookie"
            src={frames[frameIndex]}
            alt="Scroll cookie animation"
        />
    );
}