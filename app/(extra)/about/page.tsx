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
  Sparkles,
  Award,
  Music,
  ArrowRight,
  Terminal,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { creatorProfile } from "@/constants/team-members";
import { useConvexAuth } from "convex/react";
import { Spinner } from "@/components/spinner";
import { redirect } from "next/navigation";

export default function AboutPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [hovered, setHovered] = useState(false);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return redirect("/");
  }

  const member = creatorProfile;

  return (
    <div className="container py-10 max-w-5xl">
      <div className="space-y-12">
        {/* Header Section */}
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
            <Sparkles className="h-4 w-4" />
            <span>The Creator Behind Orphia</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl gradient-text">
            About Me
          </h1>
          <p className="mx-auto max-w-[720px] text-muted-foreground md:text-lg">
            Hi, I&apos;m Gulamgous Khan. I build scalable intelligent web systems and
            bridge state-of-the-art neural audio generation with delightful user experiences.
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
          <Card className="overflow-hidden border-primary/20 shadow-2xl bg-card/80 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row">
              {/* Creator Photo Column */}
              <div className="md:w-2/5 relative min-h-[380px] md:min-h-[480px] bg-muted overflow-hidden">
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent md:hidden" />
                <div className="absolute bottom-4 left-4 right-4 z-20 md:hidden text-white">
                  <h3 className="text-2xl font-bold">{member.name}</h3>
                  <p className="text-white/90 text-sm font-medium">
                    {member.role}
                  </p>
                </div>
              </div>

              {/* Creator Bio & Details */}
              <CardContent className="space-y-6 p-6 md:p-8 md:w-3/5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="hidden md:block">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/30">
                        {member.title || "Lead Engineer & Creator"}
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

                  {/* Narrative Bio */}
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
                    <div className="space-y-2.5">
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

                {/* Social Actions & Contact */}
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border/60">
                  <Link
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 rounded-full border-primary/20 hover:bg-primary/10 hover:text-primary transition-all"
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
                      className="gap-2 rounded-full border-secondary/20 hover:bg-secondary/10 hover:text-secondary transition-all"
                    >
                      <Linkedin className="h-4 w-4" />
                      <span>LinkedIn</span>
                    </Button>
                  </Link>

                  <Link
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                      member.mail.toLowerCase()
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 rounded-full border-accent/20 hover:bg-accent/10 hover:text-accent transition-all"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-primary/20 bg-card/50 p-6 rounded-2xl hover:border-primary/40 transition-all shadow-md">
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
              real-time reactive state management, Clerk security, and dynamic responsive styling.
            </p>
          </Card>

          <Card className="border-secondary/20 bg-card/50 p-6 rounded-2xl hover:border-secondary/40 transition-all shadow-md">
            <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary mb-4">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-base mb-2">Neural Music AI</h3>
            <p
              className="text-sm text-muted-foreground leading-relaxed text-justify"
              style={{ textAlign: "justify" }}
            >
              Integrated with deep learning music generation models, coupled with an
              instant procedural harmonic synthesis engine delivering zero-failure audio rendering.
            </p>
          </Card>

          <Card className="border-accent/20 bg-card/50 p-6 rounded-2xl hover:border-accent/40 transition-all shadow-md">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-4">
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
              music composition for creators, developers, storytellers, and indie game builders.
            </p>
          </Card>
        </div>

        {/* Quick CTA to Prompt Creation */}
        <div className="p-8 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1">
            <h3 className="text-xl font-bold">Ready to create music?</h3>
            <p className="text-sm text-muted-foreground">
              Turn your thoughts into original musical compositions with AI.
            </p>
          </div>
          <Link href="/create/prompt">
            <Button className="gap-2 rounded-full font-semibold">
              <Music className="h-4 w-4" />
              <span>Create Track Now</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
