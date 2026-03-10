import Link from "next/link";
import Image from "next/image";
import { Target, BookOpen, Map } from "lucide-react";
import PartnerCarousel from "@/app/components/ParterCarousel";
import ProtectedButton from "@/app/components/ProtectedButton";

export default function Home() {
  const features = [
    {
      icon: Target,
      title: "Personalized Guidance",
      description: "Tailored recommendations based on your assessment results.",
    },
    {
      icon: BookOpen,
      title: "In-Depth Research",
      description:
        "Access detailed profiles of thousands of modern and emerging careers.",
    },
    {
      icon: Map,
      title: "Actionable Insights",
      description: "Build a concrete, practical roadmap to reach your goals.",
    },
  ];

  const partnerPlaceholders = [
    "university-of-alberta",
    "university-of-calgary",
    "nait",
    "sait",
  ];

  return (
    <>
      <section className="w-full bg-background py-16 md:py-24 px-6 md:px-12 lg:px-20 relative overflow-hidden">
          {/* Upside Down Wave SVG Background - Smooth Cubic */}
          <div className="absolute inset-0 pointer-events-none">
            <svg
              className="absolute bottom-0 left-0 w-full h-full"
              viewBox="0 0 1440 800"
              preserveAspectRatio="xMidYMid slice"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0,800 L1440,800 L1440,200 C1100,200 1000,680 720,600 C400,520 200,650 0,600 Z"
                fill="#c1e4ff"
                opacity="1"
              />
            </svg>
          </div>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
            <div className="flex-1 space-y-6">
              <h1 className="text-4xl md:text-[56px] md:leading-[1.1] font-md text-foreground">
                Chart Your Path.{" "}
                <span className="text-primary">Find Your Perfect Program.</span>
              </h1>
              <p className="text-md font-semibold text-foreground w-full leading-relaxed">
                Pathr is an intelligent career guidance platform designed
                specifically for students and young professionals. Discover
                paths that align with your passions, skills, and values.
              </p>
              <ProtectedButton
                href="/profile"
                mode="signup"
                className="inline-flex items-center rounded-full border-primary border px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-[#342158] transition-colors"
              >
                Take the Pathr Assessment
              </ProtectedButton>
            </div>

            <div className="flex-1 flex justify-center">
              <Image
                src="/assets/hero-illustration.png"
                alt="Student with career exploration icons"
                width={420}
                height={420}
                className="w-full max-w-120 h-auto"
                priority
              />
            </div>
          </div>
        </section>

        <section className="w-full bg-secondary-foreground py-16 md:py-24 px-6 md:px-12 lg:px-20">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-[40px] font-medium text-foreground">
                Why Choose Pathr?
              </h2>
              <div className="space-y-6">
                {features.map((feature) => (
                  <div key={feature.title} className="flex gap-4">
                    <div>
                      <feature.icon className="w-11 h-11 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-md">
                        {feature.title}
                      </h3>
                      <p className="text-foreground font-light">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/recommendations"
                className="inline-flex items-center rounded-full border-2 border-foreground px-4 py-2 text-sm font-bold bg-background text-primary hover:bg-foreground hover:text-white transition-colors"
              >
                Learn more
              </Link>
            </div>

            <div>
              <h2 className="text-3xl md:text-[40px] font-medium text-foreground mb-8">
                Alberta Partnerships
              </h2>
              <p className="text-foreground font-semibold text-md leading-relaxed">
                We collaborate with leading institutions and trusted labour
                market data sources across Alberta to keep recommendations
                relevant, practical, and future-ready.
              </p>
              <PartnerCarousel  partners={partnerPlaceholders.map((name) => ({
                name,
                src: `/partners/${name.toLowerCase().replace(/\s/g, "-")}.png`,
              }))} />
              <Link
                href="/recommendations"
                className="mt-5 inline-flex items-center rounded-full border-2 border-foreground px-4 py-2 text-sm font-bold bg-background text-primary hover:bg-foreground hover:text-white transition-colors"
              >
                Browse our partner institutions
              </Link>
            </div>
          </div>
        </section>

        <section className="w-full bg-background py-16 md:py-24 px-6 md:px-12 lg:px-20">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 items-center gap-10">
            <div className="flex justify-center md:justify-start">
              <Image
                src="/assets/cta-illustration.png"
                alt="Student exploring pathways with a compass"
                width={230}
                height={230}
                className="h-auto w-45 md:w-120"
              />
            </div>
            <div className="space-y-6 text-left md:pl-10">
              <h2 className="text-3xl md:text-[40px] font-medium text-foreground">
                Ready to discover your future?
              </h2>
              <p className="font-semibold text-md text-foreground leading-relaxed">
                Start our quick, interactive assessment and uncover pathways you
                may not have considered yet. It is time to find your fit.
              </p>
              <ProtectedButton
                href="/profile"
                mode="signup"
                className="inline-flex items-center rounded-full border-primary border px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-[#342158] transition-colors"
              >
                Discover Your Path Now
              </ProtectedButton>
            </div>
          </div>
        </section>
    </>
  );
}
