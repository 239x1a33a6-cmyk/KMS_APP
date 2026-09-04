const mongoose = require("mongoose");
const User = require("../models/User");
const Resource = require("../models/Resource");

const buildDemoData = () => {
  const demoUsers = [
    {
      name: "Demo User",
      email: "demo@knowledgevault.app",
      password: "Demo123!",
      role: "user",
    },
    {
      name: "Aisha Patel",
      email: "aisha@knowledgevault.app",
      password: "Demo123!",
      role: "user",
    },
    {
      name: "Rahul Nair",
      email: "rahul@knowledgevault.app",
      password: "Demo123!",
      role: "user",
    },
  ];

  const demoResources = [
    {
      userIndex: 0,
      title: "Welcome to KnowledgeVault",
      description: "Kickoff notes for the demo workspace.",
      content:
        "This demo workspace contains a few sample notes, links, and articles so you can test the experience immediately.",
      type: "NOTE",
      category: "Getting Started",
      tags: ["demo", "welcome"],
      url: "",
      language: "",
      visibility: "PUBLIC",
    },
    {
      userIndex: 0,
      title: "React Learning Checklist",
      description: "A quick checklist for React fundamentals.",
      content:
        "1. Understand components and props\n2. Learn state and effects\n3. Build reusable UI blocks\n4. Practice forms and validation",
      type: "ARTICLE",
      category: "Learning",
      tags: ["react", "frontend"],
      url: "",
      language: "en",
      visibility: "PRIVATE",
    },
    {
      userIndex: 1,
      title: "MongoDB tips",
      description: "Useful MongoDB reminders for local development.",
      content:
        "Use indexes for frequent filters, validate schemas early, and keep backups for app data. Use a local dev database for experiments.",
      type: "NOTE",
      category: "Backend",
      tags: ["mongodb", "database"],
      url: "",
      language: "en",
      visibility: "PUBLIC",
    },
    {
      userIndex: 1,
      title: "Node.js performance guide",
      description: "A curated list of links about Node performance.",
      content:
        "Performance best practices include keeping async work non-blocking and profiling bottlenecks.",
      type: "LINK",
      category: "Engineering",
      tags: ["node", "performance"],
      url: "https://nodejs.org/en/docs/guides/",
      language: "",
      visibility: "PUBLIC",
    },
    {
      userIndex: 2,
      title: "JavaScript utility snippet",
      description: "Reusable helper for safe JSON parsing.",
      content:
        "const safeJson = (value) => { try { return JSON.parse(value); } catch { return null; } };",
      type: "CODE",
      category: "Development",
      tags: ["javascript", "snippet"],
      url: "",
      language: "javascript",
      visibility: "PRIVATE",
    },
  ];

  return { users: demoUsers, resources: demoResources };
};

const seedDemoData = async () => {
  if (mongoose.connection.readyState !== 1) {
    return { users: 0, resources: 0, skipped: true };
  }

  const { users, resources } = buildDemoData();
  const createdUsers = [];

  for (const userData of users) {
    const email = userData.email.toLowerCase();
    const existing = await User.findOne({ email });

    if (existing) {
      createdUsers.push(existing);
      continue;
    }

    const created = await User.create({ ...userData, email });
    createdUsers.push(created);
  }

  let createdResources = 0;

  for (const resourceData of resources) {
    const owner = createdUsers[resourceData.userIndex % createdUsers.length];
    const existing = await Resource.findOne({
      createdBy: owner._id,
      title: resourceData.title,
    });

    if (existing) {
      continue;
    }

    await Resource.create({
      ...resourceData,
      createdBy: owner._id,
      url: resourceData.url || "",
      language: resourceData.language || "",
      tags: resourceData.tags || [],
    });

    createdResources += 1;
  }

  return {
    users: createdUsers.length,
    resources: createdResources,
    skipped: false,
  };
};

module.exports = {
  buildDemoData,
  seedDemoData,
};
