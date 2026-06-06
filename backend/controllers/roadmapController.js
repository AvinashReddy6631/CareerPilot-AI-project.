const RoadmapHistory = require("../models/RoadmapHistory");

const ROADMAP_TEMPLATES = {
  frontend: {
    stages: [
      {
        title: "HTML, CSS, JavaScript",
        goal: "Build responsive, interactive static websites from scratch",
        topics: [
          "HTML5 semantic structure",
          "CSS Flexbox & Grid",
          "Responsive design",
          "JavaScript ES6+ fundamentals",
          "DOM manipulation",
          "Async JavaScript (fetch, promises)",
        ],
        projects: [
          {
            name: "Personal Portfolio Landing Page",
            description: "A responsive single-page site showcasing your bio, skills, and contact form.",
            difficulty: "Beginner",
          },
          {
            name: "Interactive To-Do App",
            description: "Vanilla JS app with local storage, filters, and drag-to-reorder tasks.",
            difficulty: "Beginner",
          },
        ],
        resources: [
          { name: "freeCodeCamp Responsive Web Design", type: "course", provider: "freeCodeCamp", url: "https://www.freecodecamp.org" },
          { name: "JavaScript.info", type: "docs", provider: "javascript.info", url: "https://javascript.info" },
          { name: "CSS-Tricks Flexbox Guide", type: "article", provider: "CSS-Tricks", url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/" },
        ],
        certification: { name: "Responsive Web Design", provider: "freeCodeCamp" },
      },
      {
        title: "React.js",
        goal: "Build component-driven UIs with modern React patterns",
        topics: [
          "JSX & component architecture",
          "Props, state & hooks (useState, useEffect)",
          "React Router",
          "Forms & controlled components",
          "Custom hooks",
          "Component composition",
        ],
        projects: [
          {
            name: "Movie Discovery App",
            description: "Search and bookmark movies using a public API with React Router.",
            difficulty: "Intermediate",
          },
          {
            name: "E-commerce Product Grid",
            description: "Filterable product catalog with cart state and checkout flow.",
            difficulty: "Intermediate",
          },
        ],
        resources: [
          { name: "React Official Docs", type: "docs", provider: "React", url: "https://react.dev" },
          { name: "Scrimba React Course", type: "course", provider: "Scrimba", url: "https://scrimba.com" },
          { name: "Epic React by Kent C. Dodds", type: "course", provider: "Epic Web", url: "https://epicreact.dev" },
        ],
        certification: { name: "Front End Development Libraries", provider: "freeCodeCamp" },
      },
      {
        title: "State Management",
        goal: "Manage complex application state predictably at scale",
        topics: [
          "Context API patterns",
          "Redux Toolkit / Zustand",
          "Server state with React Query",
          "Optimistic updates",
          "State normalization",
          "Performance optimization",
        ],
        projects: [
          {
            name: "Real-time Dashboard",
            description: "Analytics dashboard with global state, filters, and live data refresh.",
            difficulty: "Intermediate",
          },
        ],
        resources: [
          { name: "Redux Toolkit Docs", type: "docs", provider: "Redux", url: "https://redux-toolkit.js.org" },
          { name: "TanStack Query Docs", type: "docs", provider: "TanStack", url: "https://tanstack.com/query" },
        ],
        certification: null,
      },
      {
        title: "API Integration",
        goal: "Connect frontends to REST and GraphQL backends securely",
        topics: [
          "REST API consumption",
          "Authentication (JWT, OAuth)",
          "Error handling & loading states",
          "GraphQL basics",
          "API testing with Postman",
          "Environment variables & secrets",
        ],
        projects: [
          {
            name: "Social Feed App",
            description: "Authenticated app with posts, likes, and comments via REST API.",
            difficulty: "Intermediate",
          },
        ],
        resources: [
          { name: "MDN Fetch API Guide", type: "docs", provider: "MDN", url: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API" },
          { name: "Postman Learning Center", type: "course", provider: "Postman", url: "https://learning.postman.com" },
        ],
        certification: null,
      },
      {
        title: "Projects & Portfolio",
        goal: "Ship 2–3 polished projects that demonstrate hire-ready skills",
        topics: [
          "Git & GitHub workflows",
          "CI/CD basics",
          "Accessibility (WCAG)",
          "Performance (Lighthouse)",
          "SEO fundamentals",
          "Deployment (Vercel, Netlify)",
        ],
        projects: [
          {
            name: "Full-Stack SaaS Clone",
            description: "End-to-end app with auth, dashboard, and payment integration mock.",
            difficulty: "Advanced",
          },
          {
            name: "Open Source Contribution",
            description: "Contribute a meaningful PR to a popular frontend library or tool.",
            difficulty: "Advanced",
          },
        ],
        resources: [
          { name: "GitHub Skills", type: "course", provider: "GitHub", url: "https://skills.github.com" },
          { name: "web.dev Performance", type: "docs", provider: "Google", url: "https://web.dev/performance" },
        ],
        certification: { name: "Meta Front-End Developer", provider: "Coursera / Meta" },
      },
      {
        title: "Internship Preparation",
        goal: "Become job-ready with interview skills and a standout portfolio",
        topics: [
          "Frontend system design basics",
          "JavaScript coding interviews",
          "Behavioral interview prep",
          "Resume & LinkedIn optimization",
          "Networking & referrals",
          "Salary negotiation basics",
        ],
        projects: [
          {
            name: "Portfolio Website v2",
            description: "Production-grade portfolio with case studies, blog, and contact funnel.",
            difficulty: "Advanced",
          },
        ],
        resources: [
          { name: "Frontend Interview Handbook", type: "book", provider: "yangshun", url: "https://www.frontendinterviewhandbook.com" },
          { name: "LeetCode JavaScript Track", type: "practice", provider: "LeetCode", url: "https://leetcode.com" },
        ],
        certification: { name: "Google UX Design Certificate", provider: "Coursera / Google" },
      },
    ],
    jobReadinessMonth: 6,
    certifications: [
      { name: "Responsive Web Design", provider: "freeCodeCamp", month: 1 },
      { name: "Front End Development Libraries", provider: "freeCodeCamp", month: 2 },
      { name: "Meta Front-End Developer", provider: "Coursera / Meta", month: 5 },
      { name: "Google UX Design Certificate", provider: "Coursera / Google", month: 6 },
    ],
  },
  ai: {
    stages: [
      {
        title: "Python",
        goal: "Write clean Python for data manipulation and scripting",
        topics: [
          "Python syntax & data types",
          "Functions & OOP",
          "NumPy arrays",
          "Pandas DataFrames",
          "Virtual environments",
          "File I/O & APIs",
        ],
        projects: [
          {
            name: "Data Cleaning Pipeline",
            description: "Automate CSV ingestion, cleaning, and export with Pandas.",
            difficulty: "Beginner",
          },
        ],
        resources: [
          { name: "Python Official Tutorial", type: "docs", provider: "Python", url: "https://docs.python.org/3/tutorial/" },
          { name: "Kaggle Python Course", type: "course", provider: "Kaggle", url: "https://www.kaggle.com/learn/python" },
        ],
        certification: { name: "Python for Everybody", provider: "Coursera / Michigan" },
      },
      {
        title: "Statistics",
        goal: "Understand the math behind machine learning decisions",
        topics: [
          "Descriptive statistics",
          "Probability distributions",
          "Hypothesis testing",
          "Linear regression",
          "Correlation & causation",
          "Bayesian thinking",
        ],
        projects: [
          {
            name: "A/B Test Analyzer",
            description: "Statistical significance calculator for product experiments.",
            difficulty: "Beginner",
          },
        ],
        resources: [
          { name: "StatQuest YouTube", type: "video", provider: "StatQuest", url: "https://www.youtube.com/c/joshstarmer" },
          { name: "Khan Academy Statistics", type: "course", provider: "Khan Academy", url: "https://www.khanacademy.org/math/statistics-probability" },
        ],
        certification: null,
      },
      {
        title: "Machine Learning",
        goal: "Build and evaluate classical ML models",
        topics: [
          "Supervised learning",
          "Classification & regression",
          "Feature engineering",
          "Model evaluation (precision, recall, F1)",
          "Cross-validation",
          "Scikit-learn pipelines",
        ],
        projects: [
          {
            name: "Customer Churn Predictor",
            description: "End-to-end ML pipeline with EDA, training, and model comparison.",
            difficulty: "Intermediate",
          },
        ],
        resources: [
          { name: "Andrew Ng ML Specialization", type: "course", provider: "Coursera", url: "https://www.coursera.org/specializations/machine-learning-introduction" },
          { name: "Scikit-learn Docs", type: "docs", provider: "scikit-learn", url: "https://scikit-learn.org" },
        ],
        certification: { name: "Machine Learning Specialization", provider: "Coursera / DeepLearning.AI" },
      },
      {
        title: "Deep Learning",
        goal: "Train neural networks for vision and sequence tasks",
        topics: [
          "Neural network fundamentals",
          "CNNs for computer vision",
          "RNNs & transformers intro",
          "PyTorch / TensorFlow",
          "Transfer learning",
          "GPU training basics",
        ],
        projects: [
          {
            name: "Image Classifier",
            description: "Fine-tune a pre-trained model on a custom image dataset.",
            difficulty: "Advanced",
          },
        ],
        resources: [
          { name: "Fast.ai Practical Deep Learning", type: "course", provider: "fast.ai", url: "https://course.fast.ai" },
          { name: "PyTorch Tutorials", type: "docs", provider: "PyTorch", url: "https://pytorch.org/tutorials/" },
        ],
        certification: { name: "Deep Learning Specialization", provider: "Coursera / DeepLearning.AI" },
      },
      {
        title: "NLP & LLMs",
        goal: "Work with text data and large language models",
        topics: [
          "Text preprocessing & tokenization",
          "Embeddings & vector search",
          "Prompt engineering",
          "RAG architectures",
          "Fine-tuning LLMs",
          "AI safety & evaluation",
        ],
        projects: [
          {
            name: "Document Q&A Chatbot",
            description: "RAG-powered assistant over your own PDF knowledge base.",
            difficulty: "Advanced",
          },
        ],
        resources: [
          { name: "Hugging Face Course", type: "course", provider: "Hugging Face", url: "https://huggingface.co/learn" },
          { name: "OpenAI Cookbook", type: "docs", provider: "OpenAI", url: "https://cookbook.openai.com" },
        ],
        certification: { name: "Generative AI with LLMs", provider: "Coursera / DeepLearning.AI" },
      },
      {
        title: "AI Projects",
        goal: "Deploy production AI systems and land your first AI role",
        topics: [
          "MLOps & model deployment",
          "Docker & cloud (AWS/GCP)",
          "Model monitoring",
          "AI portfolio presentation",
          "Technical interviews",
          "Ethics & responsible AI",
        ],
        projects: [
          {
            name: "End-to-End ML API",
            description: "Deploy a model as a REST API with monitoring and versioning.",
            difficulty: "Advanced",
          },
          {
            name: "Kaggle Competition Entry",
            description: "Submit to a live competition and document your approach.",
            difficulty: "Advanced",
          },
        ],
        resources: [
          { name: "Made With ML", type: "course", provider: "Made With ML", url: "https://madewithml.com" },
          { name: "MLOps Zoomcamp", type: "course", provider: "DataTalks.Club", url: "https://github.com/DataTalksClub/mlops-zoomcamp" },
        ],
        certification: { name: "TensorFlow Developer Certificate", provider: "Google" },
      },
    ],
    jobReadinessMonth: 6,
    certifications: [
      { name: "Python for Everybody", provider: "Coursera / Michigan", month: 1 },
      { name: "Machine Learning Specialization", provider: "Coursera / DeepLearning.AI", month: 3 },
      { name: "Deep Learning Specialization", provider: "Coursera / DeepLearning.AI", month: 4 },
      { name: "Generative AI with LLMs", provider: "Coursera / DeepLearning.AI", month: 5 },
      { name: "TensorFlow Developer Certificate", provider: "Google", month: 6 },
    ],
  },
  default: {
    stages: [
      {
        title: "Programming Fundamentals",
        goal: "Master core programming concepts in your chosen language",
        topics: [
          "Variables & data types",
          "Control flow & loops",
          "Functions & scope",
          "OOP basics",
          "Debugging techniques",
          "Version control with Git",
        ],
        projects: [
          {
            name: "CLI Utility Tool",
            description: "A command-line app that solves a real problem (file organizer, budget tracker).",
            difficulty: "Beginner",
          },
        ],
        resources: [
          { name: "CS50 Introduction to CS", type: "course", provider: "Harvard", url: "https://cs50.harvard.edu" },
          { name: "freeCodeCamp Curriculum", type: "course", provider: "freeCodeCamp", url: "https://www.freecodecamp.org" },
        ],
        certification: { name: "CS50 Certificate", provider: "Harvard / edX" },
      },
      {
        title: "Data Structures",
        goal: "Solve problems efficiently with the right data structures",
        topics: [
          "Arrays & linked lists",
          "Stacks & queues",
          "Trees & graphs",
          "Hash tables",
          "Sorting algorithms",
          "Big-O complexity",
        ],
        projects: [
          {
            name: "Algorithm Visualizer",
            description: "Interactive tool showing how sorting and search algorithms work.",
            difficulty: "Intermediate",
          },
        ],
        resources: [
          { name: "NeetCode Roadmap", type: "practice", provider: "NeetCode", url: "https://neetcode.io" },
          { name: "Grokking Data Structures", type: "course", provider: "Educative", url: "https://www.educative.io" },
        ],
        certification: null,
      },
      {
        title: "Projects",
        goal: "Build a portfolio of real-world applications",
        topics: [
          "System design basics",
          "Database fundamentals",
          "API design",
          "Testing & CI/CD",
          "Documentation",
          "Deployment",
        ],
        projects: [
          {
            name: "Full-Stack CRUD App",
            description: "Authenticated web app with database, API, and deployed frontend.",
            difficulty: "Intermediate",
          },
          {
            name: "Capstone Project",
            description: "A unique project solving a problem you care about — your portfolio centerpiece.",
            difficulty: "Advanced",
          },
        ],
        resources: [
          { name: "The Odin Project", type: "course", provider: "The Odin Project", url: "https://www.theodinproject.com" },
          { name: "GitHub Student Developer Pack", type: "toolkit", provider: "GitHub", url: "https://education.github.com/pack" },
        ],
        certification: { name: "AWS Cloud Practitioner", provider: "Amazon" },
      },
      {
        title: "Internship Preparation",
        goal: "Polish your profile and ace technical interviews",
        topics: [
          "Coding interview patterns",
          "Resume & cover letter",
          "LinkedIn & networking",
          "Mock interviews",
          "Company research",
          "Offer evaluation",
        ],
        projects: [
          {
            name: "Professional Portfolio",
            description: "Deployed portfolio with project case studies and downloadable resume.",
            difficulty: "Intermediate",
          },
        ],
        resources: [
          { name: "Cracking the Coding Interview", type: "book", provider: "Gayle McDowell", url: "https://www.crackingthecodinginterview.com" },
          { name: "Pramp Mock Interviews", type: "practice", provider: "Pramp", url: "https://www.pramp.com" },
        ],
        certification: { name: "LinkedIn Learning Career Prep", provider: "LinkedIn" },
      },
    ],
    jobReadinessMonth: 4,
    certifications: [
      { name: "CS50 Certificate", provider: "Harvard / edX", month: 1 },
      { name: "AWS Cloud Practitioner", provider: "Amazon", month: 3 },
      { name: "LinkedIn Learning Career Prep", provider: "LinkedIn", month: 4 },
    ],
  },
};

const resolveTemplate = (role) => {
  const lower = role.toLowerCase();
  if (lower.includes("frontend") || lower.includes("front-end") || lower.includes("react")) {
    return ROADMAP_TEMPLATES.frontend;
  }
  if (
    lower.includes("ai") ||
    lower.includes("ml") ||
    lower.includes("machine learning") ||
    lower.includes("data scien")
  ) {
    return ROADMAP_TEMPLATES.ai;
  }
  return ROADMAP_TEMPLATES.default;
};

const buildStages = (template) =>
  template.stages.map((stage, index) => ({
    month: index + 1,
    ...stage,
  }));

const generateRoadmap = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !role.trim()) {
      return res.status(400).json({
        success: false,
        message: "Role is required",
      });
    }

    const template = resolveTemplate(role);
    const stages = buildStages(template);

    const roadmap = stages.map((s) => s.title);

    const totalTopics = stages.reduce((sum, s) => sum + s.topics.length, 0);
    const totalProjects = stages.reduce((sum, s) => sum + s.projects.length, 0);

    if (req.user?._id) {
      await RoadmapHistory.create({
        user: req.user._id,
        role: role.trim(),
        stagesCount: stages.length,
        estimatedMonths: stages.length,
        jobReadinessMonth: template.jobReadinessMonth,
        milestones: roadmap,
      });
    }

    res.status(200).json({
      success: true,
      role,
      roadmap,
      stages,
      meta: {
        estimatedMonths: stages.length,
        jobReadinessMonth: template.jobReadinessMonth,
        totalTopics,
        totalProjects,
        totalResources: stages.reduce((sum, s) => sum + s.resources.length, 0),
        certifications: template.certifications,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  generateRoadmap,
};
