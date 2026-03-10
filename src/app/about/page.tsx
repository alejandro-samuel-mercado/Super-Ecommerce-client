"use client";

import { about } from "@/../content/about";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Award,
  CheckCircle,
  Leaf,
  Lightbulb,
  Linkedin,
  Lock,
  ShieldCheck,
  Twitter,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const iconMap: Record<string, any> = {
  award: Award,
  users: Users,
  lightbulb: Lightbulb,
  leaf: Leaf,
  "shield-check": ShieldCheck,
  lock: Lock,
  "check-circle": CheckCircle,
};

export default function AboutPage() {
  return (
    <main className="min-h-screen pb-40  relative overflow-hidden">
      <section className="relative pt-40 max-sm:pt-20 pb-48 max-sm:pb-20  flex items-center justify-center overflow-hidden bg-gradient-to-r from-secondary/60 to-primary/60">
        <div className="absolute inset-0 overflow-hidden pointer-events-none ">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px]  rounded-full blur-[100px] -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px]  rounded-full blur-[100px] translate-y-1/2"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center ">
          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter text-white drop-shadow-2xl">
            {about.hero.title}
          </h1>

          <p className="text-xl md:text-3xl text-purple-100 max-w-3xl mx-auto leading-relaxed font-bold drop-shadow-md">
            {about.hero.subtitle}
          </p>
        </div>
      </section>

      <div className="relative sm:-top-[1px] md:top-0 left-0 w-full  leading-[0] z-20 ">
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-[calc(100%+1.3px)] h-[100px]"
        >
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#b34d8e" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <path className="max-sm:hidden"
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            fill="url(#waveGradient)"
          ></path>
          <path
  className="sm:hidden"
  d="M0,0 L0,60 Q600,90 1200,60 L1200,0 Z"
  fill="url(#waveGradient)"
/>
        </svg>
      </div>

      <section className="py-20 relative  ">
        <div className="container mx-auto px-4 max-lg:px-10  max-md:px-20  ">
          <div className="relative max-w-5xl mx-auto  max-lg:pt-20">
            <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-2 bg-gradient-to-b from-secondary to-indigo-500 md:-ml-1 rounded-full opacity-30"></div>

            {about.story.timeline.map((item, idx) => (
              <TimelineItem key={idx} item={item} index={idx} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 ">
        <div className="container mx-auto px-4 max-lg:px-10  max-md:px-20">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-gray-900">
              {about.mission.title}
            </h2>
            <p className="text-xl text-gray-600 font-medium">
              {about.mission.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {about.values.map((value, idx) => (
              <ValueCard key={idx} value={value} index={idx} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 max-lg:px-10 max-md:px-20">
          <h2 className="text-4xl md:text-6xl font-black text-center mb-20 text-gray-900">
            {about.team.title}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {about.team.members.map((member, idx) => (
              <div
                key={idx}
                className="group relative transform transition-all duration-300 hover:-translate-y-2"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] border-4 border-secondary shadow-[0_10px_40px_-10px_rgba(168,85,247,0.4)] bg-white h-full">
                  {member.image ? (
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                      <span className="text-4xl font-bold opacity-20">?</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 via-purple-900/40 to-transparent flex flex-col justify-end p-8 text-white opacity-100">
                    <h3 className="text-2xl font-bold mb-1">{member.name}</h3>
                    <p className="font-bold text-purple-200 mb-4 uppercase tracking-wider text-sm">
                      {member.role}
                    </p>

                    <div className="flex gap-4">
                      {member.social.linkedin && (
                        <Linkedin
                          onClick={() =>
                            window.open(member.social.linkedin, "_blank")
                          }
                          className="w-6 h-6 hover:text-white text-purple-200 cursor-pointer transition-colors"
                        />
                      )}
                      {member.social.twitter && (
                        <Twitter
                          onClick={() =>
                            window.open(member.social.twitter, "_blank")
                          }
                          className="w-6 h-6 hover:text-white text-purple-200 cursor-pointer transition-colors"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-white border-4 border-gray-300 rounded-[2.5rem] p-12 md:p-16 shadow-lg max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              {about.cta.title}
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10">
              {about.cta.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                size="lg"
                className="rounded-full h-14 px-10 text-lg font-bold shadow-lg"
                asChild
              >
                <Link href="/products">{about.cta.primaryButton}</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full h-14 px-10 text-lg border-4 border-gray-300 hover:bg-gray-50 font-bold"
                asChild
              >
                <Link href="/contact">{about.cta.secondaryButton}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function TimelineItem({ item, index }: { item: any; index: number }) {
  const isEven = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className={`flex flex-col md:flex-row gap-10 mb-16 relative ${isEven ? "md:flex-row-reverse" : ""}`}
    >
      
      <div className={`flex-1 ${isEven ? "md:text-right" : "text-left"}`}>
        <div className="bg-white p-8 rounded-[2.5rem] border-[3px] border-secondary shadow-[0_10px_40px_-10px_rgba(168,85,247,0.3)] hover:shadow-[0_20px_60px_-15px_rgba(168,85,247,0.5)] transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/50 rounded-bl-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>

          <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-600 to-pink-600 block mb-3 relative z-10">
            {item.year}
          </span>
          <h3 className="text-2xl font-bold mb-3 text-gray-900 relative z-10">
            {item.title}
          </h3>
          <p className="text-gray-600 text-lg leading-relaxed relative z-10 font-medium">
            {item.description}
          </p>
        </div>
      </div>

     
      <div className="absolute left-[20px] md:left-1/2 top-8 w-8 h-8 rounded-full bg-white border-[4px] border-purple-600 z-10 md:-ml-4 transform -translate-x-1/2 md:translate-x-0 shadow-[0_0_20px_rgba(147,51,234,0.5)]"></div>

      <div className="flex-1 hidden md:block" />
    </motion.div>
  );
}

function ValueCard({ value, index }: { value: any; index: number }) {
  const Icon = iconMap[value.icon];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="bg-white p-8 rounded-[2.5rem] border-[3px] border-indigo-500 shadow-[0_10px_30px_-10px_rgba(99,102,241,0.3)] hover:shadow-[0_20px_50px_-15px_rgba(99,102,241,0.5)] transition-all duration-300 text-center group hover:-translate-y-2 relative"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-50/50 rounded-[2.5rem] pointer-events-none"></div>

      <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center bg-white rounded-full border-[3px] border-indigo-200 group-hover:border-indigo-500 transition-all duration-300 shadow-lg relative z-10">
        <Icon className="w-10 h-10 text-indigo-600 group-hover:scale-110 transition-transform duration-300" />
      </div>
      <h3 className="text-2xl font-black mb-3 text-gray-900 relative z-10">
        {value.title}
      </h3>
      <p className="text-gray-600 leading-relaxed font-medium relative z-10">
        {value.description}
      </p>
    </motion.div>
  );
}
