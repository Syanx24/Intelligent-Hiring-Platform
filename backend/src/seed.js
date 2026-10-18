import "dotenv/config";
import mongoose from "mongoose";
import Job from "./models/Job.js";

const jobs = [
  {
    title: "Senior Product Designer",
    company: "Goodkind",
    companyInitials: "G",
    companyColor: "#e8e8d5",
    location: "Brooklyn, NY",
    workplace: "Hybrid",
    type: "Full-time",
    category: "Design",
    salary: "$145k – $180k",
    description:
      "Help shape a calmer, more human way for people to manage their everyday finances. You’ll partner closely with product and engineering to take ideas from early sketches through thoughtful, polished experiences. We value curiosity, craft, and a healthy willingness to challenge assumptions.",
    tags: ["Product design", "Figma", "Design systems", "Fintech"],
    featured: true,
  },
  {
    title: "Staff Frontend Engineer",
    company: "Fieldnotes",
    companyInitials: "FN",
    companyColor: "#dfede1",
    location: "Remote, US",
    workplace: "Remote",
    type: "Full-time",
    category: "Engineering",
    salary: "$190k – $230k",
    description:
      "Build the tools that help independent teams do their best work. You’ll lead frontend architecture, mentor a small and collaborative team, and work with design to make complex workflows feel surprisingly simple.",
    tags: ["React", "TypeScript", "Accessibility", "Remote"],
    featured: true,
  },
  {
    title: "Product Manager, Growth",
    company: "Commonplace",
    companyInitials: "Co",
    companyColor: "#f3e9d5",
    location: "San Francisco, CA",
    workplace: "Hybrid",
    type: "Full-time",
    category: "Product",
    salary: "$160k – $195k",
    description:
      "Make it easier for more people to find a community they love. Bring customer insight, experimentation, and a clear product perspective to a team that cares about making the internet feel a little more human.",
    tags: ["Growth", "Product strategy", "Experimentation"],
    featured: true,
  },
  {
    title: "Brand Designer",
    company: "Morrow",
    companyInitials: "M",
    companyColor: "#f0e1df",
    location: "New York, NY",
    workplace: "On-site",
    type: "Full-time",
    category: "Design",
    salary: "$110k – $140k",
    description:
      "Join a small creative team building a more considered approach to everyday skincare. You’ll shape campaigns, packaging, and digital experiences across a brand that believes good design should feel good, too.",
    tags: ["Brand", "Art direction", "Adobe Creative Suite"],
    featured: false,
  },
  {
    title: "Full-stack Engineer",
    company: "Arc Health",
    companyInitials: "A",
    companyColor: "#e1e9f0",
    location: "Remote, US",
    workplace: "Remote",
    type: "Full-time",
    category: "Engineering",
    salary: "$155k – $190k",
    description:
      "Give care teams more time for the people who need them. Build reliable product experiences with a close-knit engineering team using modern web tools, thoughtful testing, and pragmatic architecture.",
    tags: ["JavaScript", "Node.js", "Healthcare", "Remote"],
    featured: false,
  },
  {
    title: "Lifecycle Marketing Lead",
    company: "Goodkind",
    companyInitials: "G",
    companyColor: "#e8e8d5",
    location: "Brooklyn, NY",
    workplace: "Hybrid",
    type: "Full-time",
    category: "Marketing",
    salary: "$125k – $155k",
    description:
      "Help people get more out of a financial product they trust. You’ll own lifecycle strategy from first hello to long-term loyalty, partnering with creative, data, and product to make every touchpoint useful.",
    tags: ["Lifecycle", "Email", "Customer experience"],
    featured: false,
  },
  {
    title: "People & Culture Partner",
    company: "Fieldnotes",
    companyInitials: "FN",
    companyColor: "#dfede1",
    location: "Remote, US",
    workplace: "Remote",
    type: "Full-time",
    category: "People",
    salary: "$120k – $150k",
    description:
      "Help a growing, distributed team create the kind of workplace people can do their best work in. You’ll partner with managers, support thoughtful team practices, and help keep our culture human as we grow.",
    tags: ["People operations", "Culture", "Remote"],
    featured: false,
  },
  {
    title: "Product Designer, Mobile",
    company: "Layer",
    companyInitials: "L",
    companyColor: "#ebe4f1",
    location: "Austin, TX",
    workplace: "Hybrid",
    type: "Full-time",
    category: "Design",
    salary: "$130k – $165k",
    description:
      "Make everyday planning feel effortless. Work end-to-end with a curious team to design useful mobile experiences, test what works, and bring a little more delight to routines that matter.",
    tags: ["Mobile", "iOS", "Prototyping", "Figma"],
    featured: false,
  },
  {
    title: "Senior Product Manager",
    company: "Ribbon",
    companyInitials: "R",
    companyColor: "#f3e4d7",
    location: "Seattle, WA",
    workplace: "On-site",
    type: "Full-time",
    category: "Product",
    salary: "$170k – $205k",
    description:
      "Help small businesses spend less time on paperwork and more time doing what they love. Set direction for a core product area and work with a smart, kind team to turn customer problems into clear priorities.",
    tags: ["B2B SaaS", "Roadmapping", "Customer research"],
    featured: false,
  },
];

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is required. Copy .env.example to .env and configure it.");
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGODB_URI);
  await Job.deleteMany({});
  await Job.insertMany(jobs);
  console.log(`Seeded ${jobs.length} jobs.`);
} catch (error) {
  console.error("Could not seed jobs:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
