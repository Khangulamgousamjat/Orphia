import GousKhanImage from "@/assets/image/gouskhan.jpg";

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface TeamMember {
  name: string;
  role: string;
  title?: string;
  education: string;
  college: string;
  description: string;
  image: string;
  github: string;
  linkedin: string;
  mail: string;
  skills: SkillCategory[];
}

export const teamMembers: TeamMember[] = [
  {
    name: "Gous Khan",
    role: "Full Stack / AI/ML Engineer",
    title: "Lead Engineer & Creator",
    education: "B.Tech in Computer Science & Engineering",
    college: "MPGI SOE Nanded",
    description:
      "Passionate Full Stack and AI/ML Engineer with a B.Tech in CSE from MPGI SOE Nanded. Dedicated to building scalable intelligent web applications and deep learning systems, bridging state-of-the-art neural music generation with seamless user experiences.",
    image: GousKhanImage.src,
    github: "https://github.com/Khangulamgousamjat",
    linkedin: "https://www.linkedin.com/in/gulamgous",
    mail: "gousk2004@gmail.com",
    skills: [
      {
        category: "Full Stack Development",
        items: [
          "Next.js 15",
          "React 19",
          "TypeScript",
          "Node.js",
          "Tailwind CSS",
          "Convex DB",
          "REST APIs",
        ],
      },
      {
        category: "AI / Machine Learning",
        items: [
          "PyTorch",
          "Transformers",
          "Hugging Face",
          "Neural Audio Synthesis",
          "Deep Learning",
          "Python",
        ],
      },
      {
        category: "Cloud & Tools",
        items: ["Git & GitHub", "Vercel", "Docker", "Linux", "CI/CD"],
      },
    ],
  },
];

export const teacherMentor = null;
