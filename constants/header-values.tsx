import {
  Menu,
  Home,
  Sparkles,
  Upload,
  User,
  BrainCircuit,
  HeartHandshake,
  HelpCircle,
  Shield,
  FileText,
} from "lucide-react";

export const navItems = [
  { href: "/", label: "Home", icon: <Home className="h-5 w-5" /> },
  {
    href: "/create/prompt",
    label: "Create with Prompt",
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    href: "/create/sample",
    label: "Upload Sample",
    icon: <Upload className="h-5 w-5" />,
  },
  { href: "/about", label: "About Me", icon: <User className="h-5 w-5" /> },
  {
    href: "/model",
    label: "Our Model",
    icon: <BrainCircuit className="h-5 w-5" />,
  },
  {
    href: "/contribute",
    label: "Contribute",
    icon: <HeartHandshake className="h-5 w-5" />,
  },
];

export const bottomNavItems = [
  { href: "/faq", label: "FAQ", icon: <HelpCircle className="h-5 w-5" /> },
  {
    href: "/privacy-policy",
    label: "Privacy Policy",
    icon: <Shield className="h-5 w-5" />,
  },
  {
    href: "/terms-of-service",
    label: "Terms of Service",
    icon: <FileText className="h-5 w-5" />,
  },
];

export const defaultNavItems = [
  { href: "/", label: "Home" },
  { href: "/create/prompt", label: "Create with Prompt" },
  { href: "/create/sample", label: "Upload Sample" },
  { href: "/about", label: "About Me" },
  { href: "/model", label: "Our Model" },
  { href: "/contribute", label: "Contribute" },
];
