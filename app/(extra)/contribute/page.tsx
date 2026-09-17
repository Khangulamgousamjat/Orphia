"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BugIcon,
  Github,
  Lightbulb,
  Share2,
  Twitter,
  Linkedin,
  Mail,
  X,
  Send,
  Loader2,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useConvexAuth } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { Spinner } from "@/components/spinner";
import { redirect } from "next/navigation";
import { toast } from "sonner";

export default function ContributePage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { user } = useUser();

  const [activeModal, setActiveModal] = useState<"bug" | "feature" | null>(
    null
  );
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      if (!formName && user.fullName) setFormName(user.fullName);
      if (!formEmail && user.primaryEmailAddress?.emailAddress) {
        setFormEmail(user.primaryEmailAddress.emailAddress);
      }
    }
  }, [user]);

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

  const shareTitle = "Check out Orphia - AI-powered music generation!";
  const shareText =
    "I just discovered Orphia, an amazing AI tool that generates music from text prompts or audio samples. Check it out!";
  const shareUrl = "https://orphia.vercel.app";

  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText
  )}&url=${encodeURIComponent(shareUrl)}`;
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    shareUrl
  )}&title=${encodeURIComponent(shareTitle)}&summary=${encodeURIComponent(
    shareText
  )}`;
  const emailShareUrl = `mailto:?subject=${encodeURIComponent(
    shareTitle
  )}&body=${encodeURIComponent(shareText + "\n\n" + shareUrl)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim() || !formDescription.trim()) {
      toast.error("Please provide both a title and description.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: activeModal,
          title: formTitle.trim(),
          description: formDescription.trim(),
          name: formName.trim() || user?.fullName || "Anonymous",
          email:
            formEmail.trim() ||
            user?.primaryEmailAddress?.emailAddress ||
            "Not provided",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send feedback");
      }

      toast.success(
        activeModal === "bug"
          ? "Bug report submitted and sent to team Telegram!"
          : "Feature suggestion sent to team Telegram!"
      );

      // Reset form & close modal
      setFormTitle("");
      setFormDescription("");
      setActiveModal(null);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not submit. Please email gousk2004@gmail.com directly."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl gradient-text">
            Contribute to Orphia
          </h1>
          <p
            className="text-xl text-muted-foreground text-justify"
            style={{ textAlign: "justify" }}
          >
            Help us improve our AI music generator by contributing in various
            ways.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Card 1: Report Bugs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            whileHover={{ y: -5 }}
          >
            <Card className="overflow-hidden border-primary/20 h-full flex flex-col justify-between">
              <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
                <div className="flex items-center gap-2">
                  <div className="p-2 w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center">
                    <BugIcon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>Report Bugs</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6 flex-1 flex flex-col justify-between">
                <p
                  className="text-muted-foreground mb-4 text-justify"
                  style={{ textAlign: "justify" }}
                >
                  Found a bug? Let us know so we can fix it immediately. Directly
                  notifies the engineering Telegram channel.
                </p>
                <div>
                  <Button
                    onClick={() => setActiveModal("bug")}
                    className="rounded-full gap-2"
                  >
                    <BugIcon className="h-4 w-4" />
                    Report Bug
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 2: Suggest Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            whileHover={{ y: -5 }}
          >
            <Card className="overflow-hidden border-primary/20 h-full flex flex-col justify-between">
              <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
                <div className="flex items-center gap-2">
                  <div className="p-2 w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center">
                    <Lightbulb className="h-8 w-8 text-secondary" />
                  </div>
                  <CardTitle>Suggest Features</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6 flex-1 flex flex-col justify-between">
                <p
                  className="text-muted-foreground mb-4 text-justify"
                  style={{ textAlign: "justify" }}
                >
                  Have ideas for new features? We&apos;d love to hear them! Delivered
                  straight to our Telegram and email.
                </p>
                <div>
                  <Button
                    onClick={() => setActiveModal("feature")}
                    className="rounded-full gap-2"
                    variant="default"
                  >
                    <Lightbulb className="h-4 w-4" />
                    Suggest Feature
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 3: Contribute Code */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            whileHover={{ y: -5 }}
            className="sm:col-span-2"
          >
            <Card className="overflow-hidden border-primary/20 h-full flex flex-col justify-between">
              <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
                <div className="flex items-center gap-2">
                  <div className="p-2 w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center">
                    <Github className="h-8 w-8 text-accent" />
                  </div>
                  <CardTitle>Contribute Code</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6 flex-1 flex flex-col justify-between">
                <p
                  className="text-muted-foreground mb-4 text-justify"
                  style={{ textAlign: "justify" }}
                >
                  Help us improve the neural model or full-stack web application.
                  Submit pull requests, explore issues, and collaborate on GitHub.
                </p>
                <div>
                  <Button asChild className="rounded-full gap-2">
                    <a
                      href="https://github.com/Khangulamgousamjat/Orphia"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="h-4 w-4" />
                      View GitHub Repository
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Share Section */}
        <div className="rounded-lg border border-primary/20 p-6 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
          <div className="flex items-start space-x-4">
            <Share2 className="h-6 w-6 text-primary mt-1" />
            <div>
              <h3 className="font-medium text-lg gradient-text">
                Share Orphia
              </h3>
              <p
                className="text-muted-foreground mb-4 text-justify"
                style={{ textAlign: "justify" }}
              >
                Love what we&apos;re building? Help us spread the word! Share Orphia
                with friends, colleagues, and on social media to grow our
                community.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-primary/20 hover:bg-primary/10 hover:text-primary"
                  asChild
                >
                  <a
                    href={twitterShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Twitter className="h-4 w-4 mr-2" />
                    Share on Twitter
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-secondary/20 hover:bg-secondary/10 hover:text-secondary"
                  asChild
                >
                  <a
                    href={linkedinShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Linkedin className="h-4 w-4 mr-2" />
                    Share on LinkedIn
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-accent/20 hover:bg-accent/10 hover:text-accent"
                  asChild
                >
                  <a href={emailShareUrl}>
                    <Mail className="h-4 w-4 mr-2" />
                    Share via Email
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Modal for Bug Report & Feature Suggestion */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg"
            >
              <Card className="border-primary/30 shadow-2xl bg-card/95 backdrop-blur-md overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 relative pb-4">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/20 text-primary">
                      {activeModal === "bug" ? (
                        <BugIcon className="h-6 w-6" />
                      ) : (
                        <Lightbulb className="h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        {activeModal === "bug"
                          ? "Report a Bug"
                          : "Suggest a Feature"}
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        {activeModal === "bug"
                          ? "Found an issue? Tell us what went wrong so we can resolve it."
                          : "Got a cool idea? We'd love to explore implementing it."}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-4 pt-6">
                    <div className="space-y-1.5">
                      <Label htmlFor="form-title" className="text-sm font-semibold">
                        {activeModal === "bug" ? "Bug Title" : "Feature Title"}{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="form-title"
                        required
                        placeholder={
                          activeModal === "bug"
                            ? "e.g., Audio fails to play after generation"
                            : "e.g., Add MIDI file export support"
                        }
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="border-primary/20 focus-visible:ring-primary"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="form-desc"
                        className="text-sm font-semibold"
                      >
                        {activeModal === "bug"
                          ? "Details & Steps to Reproduce"
                          : "Feature Description & Use Case"}{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="form-desc"
                        required
                        rows={4}
                        placeholder={
                          activeModal === "bug"
                            ? "Explain what happened, what device or browser you used, and steps to reproduce..."
                            : "Describe how this feature should work and why it would be beneficial..."
                        }
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        className="border-primary/20 focus-visible:ring-primary resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="form-name" className="text-xs font-medium">
                          Your Name (Optional)
                        </Label>
                        <Input
                          id="form-name"
                          placeholder="Your Name"
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          className="border-primary/20 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="form-email" className="text-xs font-medium">
                          Your Email (Optional)
                        </Label>
                        <Input
                          id="form-email"
                          type="email"
                          placeholder="Your Email"
                          value={formEmail}
                          onChange={(e) => setFormEmail(e.target.value)}
                          className="border-primary/20 text-sm"
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-xs text-muted-foreground flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary shrink-0" />
                      <span>
                        Submissions instantly notify our team via Telegram Bot &amp;
                        email (<strong className="text-foreground">gousk2004@gmail.com</strong>).
                      </span>
                    </div>
                  </CardContent>

                  <div className="p-4 border-t border-border/50 bg-muted/20 flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveModal(null)}
                      disabled={isSubmitting}
                      className="rounded-full"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-full gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Submit {activeModal === "bug" ? "Report" : "Suggestion"}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
