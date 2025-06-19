"use client";


import { useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

const text = `Your blockchain experience deserves better. Companion for acing interviews like never before. We've seen the problem.`;
const letters = text.split("");

export default function Introduction() {
  const scrollTargetRef = useRef(null);
  const [currentLetter, setCurrentLetter] = useState(0);

  const { scrollYProgress } = useScroll({
    target: scrollTargetRef,
    offset: ["start end", "end end"],
  });

  const letterIndex = useTransform(scrollYProgress, [0, 1], [0, letters.length]);

  useEffect(() => {
    const unsubscribe = letterIndex.on("change", (latest) => {
      setCurrentLetter(Math.floor(latest));
    });
    return () => unsubscribe();
  }, [letterIndex]);

  return (
    <section className="relative py-12 md:py-16 bg-background text-foreground">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-center min-h-[40vh] md:min-h-[30vh]">
          <div className="w-full max-w-4xl mx-auto text-center">
            {/* Tag */}
            <div className="mb-6">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-center">About</h2>
            </div>
            {/* Headline + Animated Text */}
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 break-words">
              <span className="block text-5xl md:text-7xl font-extrabold mb-4 whitespace-pre-line break-words">
                {letters.map((letter, idx) => (
                  <span
                    key={idx}
                    className={twMerge(
                      "transition duration-300 text-muted-foreground/30",
                      idx < currentLetter && "text-primary"
                    )}
                  >
                    {letter === " " ? "\u00A0" : letter}
                  </span>
                ))}
              </span>
              <span className="block text-primary text-3xl md:text-4xl mt-6 font-extrabold">
                That's why we built XORION.
              </span>
            </h1>
            <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto mt-6">
              XORION is your all-in-one blockchain explorer and staking portal, designed for clarity, speed, and ease of use.
            </p>
          </div>
        </div>
        <div ref={scrollTargetRef} className="h-[10vh] md:h-[6vh]" />
      </div>
    </section>
  );
}
