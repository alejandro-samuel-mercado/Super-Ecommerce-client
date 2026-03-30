"use client";

import { footer } from "@/../content/footer";
import { Button } from "@/components/ui/button";
import { branchService } from "@/services/branch";
import { configService } from "@/services/config";
import { useQuery } from "@tanstack/react-query";
import {
    Clock,
    Facebook,
    Instagram,
    MapPin,
    Phone,
    Twitter,
} from "lucide-react";
import Link from "next/link";

const iconMap: Record<string, any> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
};

export function Footer() {
  const { data: config } = useQuery({
    queryKey: ["publicConfig"],
    queryFn: configService.getPublicConfig,
    staleTime: 0,
  });

  const { data: branches } = useQuery({
    queryKey: ["branches"],
    queryFn: branchService.getAll,
    staleTime: 1000 * 60 * 60, // 1 hora
  });

  const socialLinks = [
    { platform: "instagram", icon: "instagram", href: config?.socialInstagram },
    { platform: "facebook", icon: "facebook", href: config?.socialFacebook },
    { platform: "twitter", icon: "twitter", href: config?.socialTwitter },
  ].filter((s) => s.href);

  const hoursList = (() => {
    if (!config?.openingHours) return [];
    if (typeof config.openingHours === "string")
      return config.openingHours.split("\n");
    if (Array.isArray(config.openingHours))
      return config.openingHours.map((h: any) =>
        typeof h === "string" ? h : `${h.days}: ${h.hours}`,
      );

    if (typeof config.openingHours === "object" && config.openingHours !== null) {
      const dayMap: Record<string, string> = {
        monday: "Lunes",
        tuesday: "Martes",
        wednesday: "Miércoles",
        thursday: "Jueves",
        friday: "Viernes",
        saturday: "Sábado",
        sunday: "Domingo",
      };
      const orderedDays = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ];

      return orderedDays
        .filter((day) => config.openingHours[day])
        .map((day) => {
          const val = config.openingHours[day];
          const dayName = dayMap[day] || day;
          if (typeof val === "object") {
            if (val.closed) return `${dayName}: Cerrado`;
            return `${dayName}: ${val.open} - ${val.close}`;
          }
          return `${dayName}: ${val}`;
        });
    }
    return [];
  })();

  return (
    <footer className="relative bg-primary text-primary-foreground pt-20 z-10000">
      {/* Borde Ondulado */}
      <div
        className="absolute top-[2px] left-0 w-full overflow-hidden leading-[0]"
        style={{ transform: "translateY(-100%)" }}
      >
        <svg
          className="relative block w-[calc(100%+1.3px)] h-[60px]"
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          style={{ transform: "rotate(180deg)" }}
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="fill-primary"
          ></path>
        </svg>
      </div>

      <div className="container mx-auto px-10 max-lg:px-14 max-md:px-10 pb-8 max-sm:pb-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 mb-12">
          <div>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                <MapPin className="h-6 w-6 text-white/80" />
              </span>
              Nuestras Tiendas
            </h3>
            <div className="space-y-4">
              {branches && branches.length > 0
                ? branches.slice(0, 2).map((branch) => (
                    <div
                      key={branch.id}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
                    >
                      <p className="font-bold text-lg mb-1">{branch.name}</p>
                      <p className="text-primary-foreground/80 text-sm mb-1">
                        {branch.address}
                      </p>
                      {branch.city && (
                        <p className="text-primary-foreground/80 text-sm mb-2">
                          {branch.city}
                        </p>
                      )}
                      <a
                        href={`tel:${branch.phone}`}
                        className="flex items-center gap-2 text-white/80 hover:text-white transition-colors font-medium"
                      >
                        <Phone className="h-4 w-4 text-white/80" />
                        {branch.phone}
                      </a>
                    </div>
                  ))
                : footer.branches.map((branch, idx) => (
                    <div
                      key={idx}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors opacity-50"
                    >
                      <p className="font-bold text-lg mb-1">{branch.name}</p>
                      <p className="text-primary-foreground/80 text-sm mb-1">
                        {branch.address}
                      </p>
                    </div>
                  ))}
            </div>
          </div>

          {/* Horarios */}
          <div>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                <Clock className="h-6 w-6 text-white/80" />
              </span>
              Horarios
            </h3>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
              {hoursList.length > 0
                ? hoursList.map((line, idx) => (
                    <div
                      key={idx}
                      className="pb-3 border-b border-white/10 last:border-0 last:pb-0"
                    >
                      <p className="text-primary-foreground/90">{line}</p>
                    </div>
                  ))
                : footer.hours.map((schedule, idx) => (
                    <div
                      key={idx}
                      className="pb-3 border-b border-white/10 last:border-0 last:pb-0"
                    >
                      <p className="font-semibold text-secondary mb-1">
                        {schedule.days}
                      </p>
                      <p className="text-primary-foreground/90">
                        {schedule.hours}
                      </p>
                    </div>
                  ))}
            </div>
          </div>

          {/* Contacto Global */}
          <div>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                <Phone className="h-6 w-6 text-white/80" />
              </span>
              Contacto
            </h3>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-5">
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-primary-foreground/50 font-bold">
                  Teléfono de Atención
                </span>
                <a
                  href={`tel:${config?.contactPhone}`}
                  className="text-lg font-bold hover:text-secondary transition-colors truncate"
                >
                  {config?.contactPhone || footer.contact.phone}
                </a>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-primary-foreground/50 font-bold">
                  Email de Consultas
                </span>
                <a
                  href={`mailto:${config?.contactEmail}`}
                  className="text-lg font-bold hover:text-secondary transition-colors truncate"
                >
                  {config?.contactEmail || footer.contact.email}
                </a>
              </div>
              <div className="pt-2">
                <p className="text-sm text-primary-foreground/70 italic">
                  Estamos para ayudarte en lo que necesites.
                </p>
              </div>
            </div>
          </div>

          {/* Secciones de enlaces*/}
          {footer.sections.map((section, idx) => (
            <div key={idx}>
              <h3 className="text-xl font-bold mb-6 border-b-2 border-secondary/30 pb-2 inline-block">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link
                      href={link.href}
                      className="text-primary-foreground/80 hover:text-white hover:translate-x-1 transition-all flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Promo Banner */}
        <div className="mb-12 bg-black/20 rounded-2xl p-8 backdrop-blur-sm border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 justify-between">
            <div className="text-center lg:text-left">
              <h3 className="text-2xl font-bold mb-2 flex items-center justify-center lg:justify-start gap-2">
                <span className="bg-secondary/20 p-1.5 rounded-full">
                  <Clock className="w-5 h-5 text-white/80" />
                </span>
                {footer.promo.title}
              </h3>
              <p className="text-primary-foreground/80">
                {footer.promo.description}
              </p>
            </div>
            <Link href={footer.promo.buttonLink}>
              <Button className="bg-secondary hover:bg-secondary/90 text-white h-12 px-8 font-bold shadow-lg shadow-secondary/20">
                {footer.promo.buttonText}
              </Button>
            </Link>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-6">
            {socialLinks.length > 0 &&
              socialLinks.map((social, idx) => {
                const Icon = iconMap[social.icon] || Facebook;
                return (
                  <Link
                    key={idx}
                    href={social.href || "#"}
                    className="bg-white/10 p-3 rounded-full hover:bg-secondary hover:scale-110 transition-all duration-300"
                    target="_blank"
                    aria-label={social.platform}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                );
              })}
          </div>

          <div className="flex gap-6 text-sm font-medium">
            {footer.legal.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="hover:text-secondary transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <p className="text-sm opacity-60 text-center md:text-right">
            &copy; {new Date().getFullYear()}{" "}
            {config?.storeName || "StyleStore"}.{" "}
            {footer.copyright.replace(/© \d+ StyleStore\./, "")}
          </p>
        </div>
      </div>
    </footer>
  );
}
