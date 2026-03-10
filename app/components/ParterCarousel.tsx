"use client";

import Image from "next/image";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Partner {
  name: string;
  src: string;
}

export default function PartnerCarousel({ partners }: { partners: Partner[] }) {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = direction === "left" ? -250 : 250;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="relative flex items-center group">
      {/* Left Arrow */}
      <button
        onClick={() => scrollCarousel("left")}
        className="absolute left-0 z-10 -ml-4 p-2 rounded-full bg-white shadow-md border border-gray-100 text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50 hover:scale-105"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Scrollable Track */}
      <div
        ref={carouselRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory py-4 px-2 w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {partners.map((partner) => (
          <div
            key={partner.name}
            className="snap-center shrink-0 w-36 h-24 rounded-2xl bg-white border border-border flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
          >
            <Image
              src={partner.src}
              alt={`${partner.name} logo`}
              width={100}
              height={60}
              className="object-contain p-2"
            />
          </div>
        ))}
      </div>

      {/* Right Arrow */}
      <button
        onClick={() => scrollCarousel("right")}
        className="absolute right-0 z-10 -mr-4 p-2 rounded-full bg-white shadow-md border border-gray-100 text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50 hover:scale-105"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
}