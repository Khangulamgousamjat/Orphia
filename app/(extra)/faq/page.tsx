"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { HelpCircle, Send, Mail, MessageSquare } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqs } from "@/constants/faqs";

export default function FAQPage() {
  return (
    <div className="container py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="space-y-2 text-center mb-8">
          <div className="inline-block rounded-full px-3 py-1 text-sm bg-accent/10 text-accent mb-2">
            <HelpCircle className="h-4 w-4 inline-block mr-1" />
            Support
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl gradient-text">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about Orphia's AI music generation
            capabilities, usage limits, and more.
          </p>
        </div>

        <div className="bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-xl p-6">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-b border-primary/10 last:border-0"
              >
                <AccordionTrigger className="text-left hover:text-primary transition-colors py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p>{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-xl font-bold mb-4">Still have questions?</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            If you couldn&apos;t find the answer to your question, chat with our
            Telegram Bot or reach out to us directly.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <a
              href="https://t.me/portfolio_gous_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-5 shadow-sm"
            >
              <Send className="h-4 w-4" />
              <span>Telegram Bot</span>
            </a>
            <a
              href="mailto:gousk2004@gmail.com"
              className="inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background bg-secondary/10 text-secondary hover:bg-secondary/20 border border-secondary/20 h-10 py-2 px-5"
            >
              <Mail className="h-4 w-4" />
              <span>Contact Support</span>
            </a>
            <Link
              href="/contribute"
              className="inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background bg-muted text-foreground hover:bg-muted/80 border border-border/50 h-10 py-2 px-5"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Report an Issue</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
