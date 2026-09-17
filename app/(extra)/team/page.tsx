"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Github,
  Linkedin,
  Mail,
  GraduationCap,
  Code2,
  Cpu,
  Layers,
  Sparkles,
  Award,
} from "lucide-react";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { teamMembers } from "@/constants/team-members";
import { useConvexAuth } from "convex/react";
import { Spinner } from "@/components/spinner";
import { redirect } from "next/navigation";

export default function TeamPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [hovered, setHovered] = useState(false);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return redirect("/");
  }

  const member = teamMembers[0];

  return (
    <div className="container py-10 max-w-5xl">
      <div className="space-y-10">
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            <span>The Mind Behind Orphia</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl gradient-text">
            Meet Our Team
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg">
            Dedicated to transforming how music is created through artificial
            intelligence and modern web architecture.
          </p>
        </div>

        {/* Hero Creator Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ y: -4 }}
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
        >
          <Card className="overflow-hidden border-primary/20 shadow-xl bg-card/80 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-2/5 relative min-h-[380px] md:min-h-[460px] bg-muted overflow-hidden">
                <Image
                  src={member.image || "/placeholder.svg"}
                  alt={member.name}
                  fill
                  priority
                  className="object-cover object-top transition-transform duration-700 ease-out"
                  style={{
                    transform: hovered ? "scale(1.04)" : "scale(1)",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent md:hidden" />
                <div className="absolute bottom-4 left-4 right-4 z-20 md:hidden text-white">
                  <h3 className="text-2xl font-bold">{member.name}</h3>
                  <p className="text-white/80 text-sm font-medium">
                    {member.role}
                  </p>
                </div>
              </div>

              <CardContent className="space-y-6 p-6 md:p-8 md:w-3/5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="hidden md:block">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                        {member.title}
                      </span>
                    </div>
                    <h2 className="text-3xl font-extrabold gradient-text tracking-tight">
                      {member.name}
                    </h2>
                    <p className="text-base font-semibold text-primary/90 mt-1">
                      {member.role}
                    </p>
                  </div>

                  {/* Education Badge */}
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-secondary/10 border border-secondary/20">
                    <GraduationCap className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {member.education}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium">
                        {member.college}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p
                    className="text-muted-foreground leading-relaxed text-sm sm:text-base text-justify"
                    style={{ textAlign: "justify" }}
                  >
                    {member.description}
                  </p>

                  {/* Skills Section */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <Code2 className="h-3.5 w-3.5 text-primary" />
                      <span>Technical Competencies</span>
                    </div>
                    <div className="space-y-2">
                      {member.skills.map((skillGroup, idx) => (
                        <div key={idx} className="flex flex-col gap-1.5">
                          <span className="text-xs font-medium text-foreground/80">
                            {skillGroup.category}:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {skillGroup.items.map((skill, sIdx) => (
                              <span
                                key={sIdx}
                                className="px-2.5 py-1 rounded-md text-xs font-medium bg-muted text-foreground/90 border border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-colors"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Social Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-border/60">
                  <Link
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 rounded-full border-primary/20 hover:bg-primary/10 hover:text-primary"
                    >
                      <Github className="h-4 w-4" />
                      <span>GitHub</span>
                    </Button>
                  </Link>

                  <Link
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 rounded-full border-secondary/20 hover:bg-secondary/10 hover:text-secondary"
                    >
                      <Linkedin className="h-4 w-4" />
                      <span>LinkedIn</span>
                    </Button>
                  </Link>

                  <Link
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(member.mail.toLowerCase())}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 rounded-full border-primary/20 hover:bg-primary/10 hover:text-primary"
                    >
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </div>
          </Card>
        </motion.div>

        {/* Architecture & Engineering Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <Card className="border-primary/20 bg-card/50 p-6 rounded-2xl hover:border-primary/40 transition-all">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Code2 className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-base mb-2">
              Full-Stack Architecture
            </h3>
            <p
              className="text-sm text-muted-foreground leading-relaxed text-justify"
              style={{ textAlign: "justify" }}
            >
              Engineered with Next.js 15, React 19, TypeScript, and Convex for
              real-time reactive state management and responsive styling.
            </p>
          </Card>

          <Card className="border-secondary/20 bg-card/50 p-6 rounded-2xl hover:border-secondary/40 transition-all">
            <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary mb-4">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-base mb-2">Neural Music AI</h3>
            <p
              className="text-sm text-muted-foreground leading-relaxed text-justify"
              style={{ textAlign: "justify" }}
            >
              Integrated with deep learning music generation models, enabling
              text-to-audio conditioning, sample extensions, and melodic
              transformations.
            </p>
          </Card>

          <Card className="border-primary/20 bg-card/50 p-6 rounded-2xl hover:border-primary/40 transition-all">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Award className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-base mb-2">
              Engineering Vision
            </h3>
            <p
              className="text-sm text-muted-foreground leading-relaxed text-justify"
              style={{ textAlign: "justify" }}
            >
              Designed and deployed by Gulamgous Khan at MPGI SOE Nanded to democratize
              music composition for creators, developers, and media producers.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
