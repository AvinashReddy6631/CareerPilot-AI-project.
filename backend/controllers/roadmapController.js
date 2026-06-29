const RoadmapHistory = require("../models/RoadmapHistory");
const aiClient = require("../config/ai");


// NOTE: This controller previously used a single `frontend` template for many roles
// due to simplistic role matching. The roadmap must be role-specific.

// Keep the response structure unchanged, but generate role-based stages dynamically.

const buildStages = (stages) =>
  stages.map((stage, index) => ({
    month: index + 1,
    ...stage,
  }));

const keywordMatch = (text, keywords) => {
  const lower = (text || "").toLowerCase();
  return keywords.some((k) => lower.includes(k));
};

const ROLE_KEYWORDS = {
  frontend: ["frontend", "front-end", "react", "reactjs", "ui developer", "web developer"],
  backend: ["backend", "back-end", "node", "nodejs", "api", "express", "server developer"],
  fullstack: ["full stack", "fullstack", "mern", "mean", "software developer"],
  data_analyst: ["data analyst", "analytics", "business analyst", "data analytics"],
  data_scientist: ["data scientist", "data science"],
  ai_ml: ["ai engineer", "artificial intelligence", "machine learning", "ml engineer", "deep learning"],
  python: ["python developer", "python engineer"],
  devops: ["devops", "cloud engineer", "site reliability engineer"],
  // Explicit MERN keyword support (required)
  mern: ["mern stack", "mern", "mongodb", "express", "react", "node"],
};

const detectRoleTemplateKey = (rawRole) => {
  const role = (rawRole || "").trim();
  if (!role) return null;

  // Precedence matters when keywords overlap.
  // Example: "Full Stack" also contains "node"; MERN should win for MERN-specific input.
  if (keywordMatch(role, ROLE_KEYWORDS.mern)) return "fullstack";
  if (keywordMatch(role, ROLE_KEYWORDS.frontend)) return "frontend";
  if (keywordMatch(role, ROLE_KEYWORDS.backend)) return "backend";
  if (keywordMatch(role, ROLE_KEYWORDS.fullstack)) return "fullstack";
  if (keywordMatch(role, ROLE_KEYWORDS.data_analyst)) return "data_analyst";
  if (keywordMatch(role, ROLE_KEYWORDS.data_scientist)) return "data_scientist";
  if (keywordMatch(role, ROLE_KEYWORDS.ai_ml)) return "ai_ml";
  if (keywordMatch(role, ROLE_KEYWORDS.python)) return "python";
  if (keywordMatch(role, ROLE_KEYWORDS.devops)) return "devops";

  // Common variants from the UI examples/requirements
  // (e.g., "Data Analytics" should match data analyst template).
  if (keywordMatch(role, ["data analytics"])) return "data_analyst";

  return null;
};

// Roadmap templates per role. Each role must have unique topics/projects/certs/milestones.
const ROLE_ROADMAPS = {
  frontend: {
    title: "Your Path To Frontend Developer",
    stages: [
      {
        title: "HTML & CSS Fundamentals",
        goal: "Build accessible, responsive web pages and master layout fundamentals",
        topics: ["HTML5 semantics", "CSS Flexbox/Grid", "Responsive design", "Accessibility (WCAG)"],
        projects: [
          { name: "Portfolio Website", description: "A responsive portfolio with semantic HTML & clean CSS.", difficulty: "Beginner" },
          { name: "Weather App UI", description: "A UI-only weather experience with forms and responsive layout.", difficulty: "Beginner" },
        ],
        resources: [
          { name: "MDN HTML Guide", type: "docs", provider: "MDN", url: "https://developer.mozilla.org/en-US/docs/Web/HTML" },
          { name: "MDN CSS Guide", type: "docs", provider: "MDN", url: "https://developer.mozilla.org/en-US/docs/Web/CSS" },
        ],
        certification: { name: "Responsive Web Design", provider: "freeCodeCamp" },
      },
      {
        title: "JavaScript + Git/GitHub",
        goal: "Write modern JavaScript and manage code with Git workflows",
        topics: ["ES6+", "DOM manipulation", "Async (fetch/Promises)", "Git & GitHub"],
        projects: [
          { name: "Interactive To-Do App", description: "Vanilla JS to-do with local persistence and filters.", difficulty: "Beginner" },
          { name: "Form Validation Dashboard", description: "Client-side validation UI patterns.", difficulty: "Intermediate" },
        ],
        resources: [
          { name: "JavaScript.info", type: "docs", provider: "javascript.info", url: "https://javascript.info/" },
          { name: "GitHub Skills", type: "course", provider: "GitHub", url: "https://skills.github.com/" },
        ],
        certification: null,
      },
      {
        title: "React Core",
        goal: "Build component-based UIs using React hooks and routing patterns",
        topics: ["React components", "Hooks (useState/useEffect)", "Props & state", "React Router"],
        projects: [
          { name: "Dashboard", description: "Data-driven dashboard UI with filtering & reusable components.", difficulty: "Intermediate" },
        ],
        resources: [
          { name: "React Docs", type: "docs", provider: "React", url: "https://react.dev/" },
          { name: "Scrimba React", type: "course", provider: "Scrimba", url: "https://scrimba.com/learn/learnreact" },
        ],
        certification: { name: "Meta Front-End Developer", provider: "Coursera / Meta" },
      },
      {
        title: "Styling + APIs",
        goal: "Use Tailwind-style utility workflows and integrate REST APIs",
        topics: ["Tailwind CSS", "API consumption", "Loading/error states", "Environment variables"],
        projects: [
          { name: "E-Commerce UI", description: "Product listing + cart UI with API-driven product data.", difficulty: "Intermediate" },
        ],
        resources: [
          { name: "Tailwind Docs", type: "docs", provider: "Tailwind", url: "https://tailwindcss.com/docs" },
          { name: "Postman", type: "course", provider: "Postman", url: "https://learning.postman.com/" },
        ],
        certification: null,
      },
      {
        title: "Deployment + Portfolio Polish",
        goal: "Deploy confidently and package your portfolio for hiring",
        topics: ["Deployment (Vercel/Netlify)", "Performance (Lighthouse)", "Accessibility checks", "SEO fundamentals"],
        projects: [
          { name: "Portfolio Website v2", description: "Case-study portfolio with deployed projects and documentation.", difficulty: "Advanced" },
        ],
        resources: [
          { name: "web.dev Performance", type: "docs", provider: "Google", url: "https://web.dev/learn/performance/" },
        ],
        certification: null,
      },
      {
        title: "Interview Readiness",
        goal: "Prepare for frontend interviews with practical JavaScript & React review",
        topics: ["JS coding patterns", "React component thinking", "System design for UI", "Behavioral prep"],
        projects: [
          { name: "UI Systems Practice", description: "Build small components and explain tradeoffs in interviews.", difficulty: "Advanced" },
        ],
        resources: [
          { name: "Frontend Interview Handbook", type: "book", provider: "yangshun", url: "https://www.frontendinterviewhandbook.com/" },
        ],
        certification: null,
      },
    ],
    jobReadinessMonth: 6,
    certifications: [
      { name: "Responsive Web Design", provider: "freeCodeCamp", month: 1 },
      { name: "Meta Front-End Developer", provider: "Coursera / Meta", month: 3 },
    ],
  },

  backend: {
    title: "Your Path To Backend Developer",
    stages: [
      {
        title: "Node.js Fundamentals",
        goal: "Build server-side applications with Node.js and core tooling",
        topics: ["Node.js basics", "Modules & async", "File handling", "npm workflows"],
        projects: [
          { name: "Auth System", description: "Build user auth with password hashing and sessions/JWT.", difficulty: "Beginner" },
        ],
        resources: [
          { name: "Node.js Docs", type: "docs", provider: "Node", url: "https://nodejs.org/en/docs" },
        ],
        certification: null,
      },
      {
        title: "Express.js + REST APIs",
        goal: "Design clean REST APIs with proper routing, validation, and error handling",
        topics: ["Express routing", "Middleware", "Request validation", "REST conventions"],
        projects: [
          { name: "Blog API", description: "CRUD blog API with pagination and auth protection.", difficulty: "Intermediate" },
        ],
        resources: [
          { name: "Express Guide", type: "docs", provider: "Express", url: "https://expressjs.com/" },
          { name: "Postman", type: "course", provider: "Postman", url: "https://learning.postman.com/" },
        ],
        certification: null,
      },
      {
        title: "Authentication + JWT",
        goal: "Implement secure authentication with JWT and role-based access",
        topics: ["JWT", "RBAC", "Secure token storage", "Authorization checks"],
        projects: [
          { name: "Protected API Endpoints", description: "Role-protected routes and audit logging.", difficulty: "Intermediate" },
        ],
        resources: [
          { name: "OWASP Auth Cheat Sheet", type: "article", provider: "OWASP", url: "https://cheatsheetseries.owasp.org/" },
        ],
        certification: { name: "Node.js Backend Development", provider: "Coursera / Node" },
      },
      {
        title: "Databases (MongoDB + SQL Concepts)",
        goal: "Persist data reliably and query it efficiently",
        topics: ["MongoDB schemas", "Indexes", "SQL basics", "Query optimization"],
        projects: [
          { name: "E-Commerce Backend", description: "Products, orders, and users with MongoDB.", difficulty: "Advanced" },
        ],
        resources: [
          { name: "MongoDB University", type: "course", provider: "MongoDB", url: "https://university.mongodb.com/" },
        ],
        certification: { name: "MongoDB Developer", provider: "MongoDB" },
      },
      {
        title: "Security + Deployment",
        goal: "Harden your APIs and deploy with confidence",
        topics: ["Security headers", "Rate limiting", "Secrets management", "Deployment & monitoring"],
        projects: [
          { name: "Payment Integration", description: "Integrate payment flow (mock or sandbox) and secure webhooks.", difficulty: "Advanced" },
        ],
        resources: [
          { name: "Node Security Best Practices", type: "article", provider: "Snyk", url: "https://snyk.io/" },
        ],
        certification: null,
      },
      {
        title: "Backend Interview Readiness",
        goal: "Prepare for backend interviews with API design and system tradeoffs",
        topics: ["API design", "Database design", "Auth flows", "Performance considerations"],
        projects: [
          { name: "System Design Mini Projects", description: "Design small backend systems and explain scaling strategies.", difficulty: "Advanced" },
        ],
        resources: [
          { name: "Grokking the System Design Interview", type: "book", provider: "Educative", url: "https://www.educative.io/" },
        ],
        certification: null,
      },
    ],
    jobReadinessMonth: 6,
    certifications: [
      { name: "Node.js Backend Development", provider: "Coursera / Node", month: 3 },
      { name: "MongoDB Developer", provider: "MongoDB", month: 4 },
    ],
  },

  fullstack: {
    title: "Your Path To Full Stack Developer",
    stages: [
      {
        title: "Web Fundamentals + UI",
        goal: "Combine modern frontend fundamentals with practical UI patterns",
        topics: ["HTML", "CSS", "JavaScript", "Responsive layout"],
        projects: [
          { name: "MERN Blog", description: "Frontend + backend blog layout with auth-ready pages.", difficulty: "Beginner" },
        ],
        resources: [
          { name: "MDN Web Docs", type: "docs", provider: "MDN", url: "https://developer.mozilla.org/" },
        ],
        certification: null,
      },
      {
        title: "React + State",
        goal: "Build interactive React apps with routing and client-side state",
        topics: ["React components", "Hooks", "Forms", "Routing"],
        projects: [
          { name: "MERN Blog Frontend", description: "Bookmark posts, user profiles, and CRUD UI.", difficulty: "Intermediate" },
        ],
        resources: [
          { name: "React Official Docs", type: "docs", provider: "React", url: "https://react.dev/" },
        ],
        certification: null,
      },
      {
        title: "Node/Express API",
        goal: "Create REST APIs with authentication, validation, and error handling",
        topics: ["REST APIs", "Express middleware", "Validation", "JWT"],
        projects: [
          { name: "Auth API", description: "User auth, token refresh pattern (optional), protected routes.", difficulty: "Intermediate" },
        ],
        resources: [
          { name: "Express Guide", type: "docs", provider: "Express", url: "https://expressjs.com/" },
        ],
        certification: null,
      },
      {
        title: "MongoDB + Data Modeling",
        goal: "Model collections, design schemas, and optimize queries",
        topics: ["MongoDB collections", "Indexes", "Schema design", "Aggregation basics"],
        projects: [
          { name: "E-Commerce Platform", description: "Products, cart, and orders with MongoDB.", difficulty: "Advanced" },
        ],
        resources: [
          { name: "MongoDB Manual", type: "docs", provider: "MongoDB", url: "https://www.mongodb.com/docs/" },
        ],
        certification: null,
      },
      {
        title: "Deployment + Quality",
        goal: "Deploy full-stack apps and improve reliability",
        topics: ["Deployment (Render/Heroku/Vercel)", "Environment variables", "Logging", "Testing basics"],
        projects: [
          { name: "SaaS Dashboard", description: "Subscription-style dashboard UI + backend with real-time feel.", difficulty: "Advanced" },
        ],
        resources: [
          { name: "web.dev Learn", type: "docs", provider: "Google", url: "https://web.dev/learn/" },
        ],
        certification: { name: "Full Stack Development", provider: "freeCodeCamp" },
      },
      {
        title: "Full Stack Interview Readiness",
        goal: "Prepare for end-to-end architecture questions",
        topics: ["System design", "DB design", "API design", "Scaling & caching basics"],
        projects: [
          { name: "Capstone: Full-Stack MVP", description: "Ship an end-to-end app with auth, CRUD, and deployment.", difficulty: "Advanced" },
        ],
        resources: [
          { name: "System Design Primer", type: "docs", provider: "GitHub", url: "https://github.com/donnemartin/system-design-primer" },
        ],
        certification: { name: "MERN Stack Certification", provider: "freeCodeCamp / Community" },
      },
    ],
    jobReadinessMonth: 6,
    certifications: [
      { name: "Full Stack Development", provider: "freeCodeCamp", month: 5 },
      { name: "MERN Stack Certification", provider: "freeCodeCamp / Community", month: 6 },
    ],
  },

  data_analyst: {
    title: "Your Path To Data Analyst",
    stages: [
      {
        title: "Spreadsheets + KPI Thinking",
        goal: "Turn messy data into clear metrics using spreadsheets",
        topics: ["Excel formulas", "Pivot tables", "Data cleaning basics", "KPI definition"],
        projects: [
          { name: "Sales Dashboard", description: "Excel-based KPI dashboard with drilldowns.", difficulty: "Beginner" },
        ],
        resources: [
          { name: "Excel Training", type: "course", provider: "Microsoft", url: "https://support.microsoft.com/excel" },
        ],
        certification: null,
      },
      {
        title: "SQL for Analytics",
        goal: "Query and join datasets confidently for real insights",
        topics: ["SELECT/JOIN", "GROUP BY", "Window functions basics", "Data modeling"],
        projects: [
          { name: "Customer Analysis", description: "SQL cohort & segment analysis for customer behavior.", difficulty: "Intermediate" },
        ],
        resources: [
          { name: "Mode SQL Tutorial", type: "course", provider: "Mode", url: "https://mode.com/sql-tutorial/" },
        ],
        certification: null,
      },
      {
        title: "Python + Pandas",
        goal: "Automate analysis with Python and Pandas",
        topics: ["Pandas", "DataFrames", "Data wrangling", "NumPy basics"],
        projects: [
          { name: "Analytics Data Cleaning Pipeline", description: "Automate cleaning and feature engineering in notebooks.", difficulty: "Intermediate" },
        ],
        resources: [
          { name: "Pandas Docs", type: "docs", provider: "Pandas", url: "https://pandas.pydata.org/docs/" },
        ],
        certification: null,
      },
      {
        title: "Visualization (Power BI/Tableau)",
        goal: "Create compelling dashboards that tell a story",
        topics: ["Power BI modeling", "Tableau dashboards", "Chart selection", "Storytelling"],
        projects: [
          { name: "KPI Reporting", description: "Build an interactive KPI report with filters and narrative.", difficulty: "Advanced" },
        ],
        resources: [
          { name: "Power BI Learning", type: "course", provider: "Microsoft", url: "https://learn.microsoft.com/power-bi" },
        ],
        certification: { name: "Microsoft Power BI", provider: "Microsoft" },
      },
      {
        title: "Decision-Making + A/B Analysis",
        goal: "Make statistically grounded recommendations",
        topics: ["Experiment basics", "Confidence intervals", "Cohorts", "Metric design"],
        projects: [
          { name: "Experiment Insights Report", description: "Write a complete analysis memo with recommendations.", difficulty: "Advanced" },
        ],
        resources: [
          { name: "Khan Academy Stats", type: "course", provider: "Khan Academy", url: "https://www.khanacademy.org/math/statistics-probability" },
        ],
        certification: null,
      },
      {
        title: "Portfolio + Interview Readiness",
        goal: "Package your work for hiring and ace analytics interviews",
        topics: ["Case study practice", "SQL review", "Dashboard critique", "Communication"],
        projects: [
          { name: "Data Analyst Portfolio v2", description: "Deploy notebooks + dashboards and document insights.", difficulty: "Advanced" },
        ],
        resources: [
          { name: "Data Portfolio Tips", type: "article", provider: "Various", url: "https://www.example.com" },
        ],
        certification: null,
      },
    ],
    jobReadinessMonth: 5,
    certifications: [
      { name: "Google Data Analytics", provider: "Coursera / Google", month: 2 },
      { name: "Microsoft Power BI", provider: "Microsoft", month: 4 },
    ],
  },

  data_scientist: {
    title: "Your Path To Data Scientist",
    stages: [
      {
        title: "Python for Data Science",
        goal: "Use Python to explore data and build repeatable analysis pipelines",
        topics: ["Python fundamentals", "NumPy", "Pandas", "Data preprocessing"],
        projects: [
          { name: "Dataset EDA Notebook", description: "Comprehensive EDA with clear findings and plots.", difficulty: "Beginner" },
        ],
        resources: [
          { name: "Python Official Docs", type: "docs", provider: "Python", url: "https://docs.python.org/3/" },
        ],
        certification: null,
      },
      {
        title: "Statistics + Experiment Thinking",
        goal: "Understand the math for sampling, inference, and model evaluation",
        topics: ["Distributions", "Hypothesis testing", "Regression concepts", "Model metrics"],
        projects: [
          { name: "Model Evaluation Study", description: "Compare metrics and build a model evaluation rubric.", difficulty: "Intermediate" },
        ],
        resources: [
          { name: "StatQuest", type: "video", provider: "StatQuest", url: "https://www.youtube.com/c/joshstarmer" },
        ],
        certification: null,
      },
      {
        title: "Machine Learning Modeling",
        goal: "Train and validate models with scikit-learn style workflows",
        topics: ["Supervised learning", "Feature engineering", "Cross-validation", "Hyperparameter tuning"],
        projects: [
          { name: "Churn Prediction", description: "Build a churn prediction pipeline with evaluation + interpretation.", difficulty: "Intermediate" },
        ],
        resources: [
          { name: "scikit-learn Docs", type: "docs", provider: "scikit-learn", url: "https://scikit-learn.org/" },
        ],
        certification: null,
      },
      {
        title: "Recommendation + Forecasting",
        goal: "Build end-to-end models for ranking and time-based prediction",
        topics: ["Recommenders basics", "Forecasting concepts", "Data leakage avoidance", "Baselines"],
        projects: [
          { name: "Recommendation System", description: "A recommender with evaluation and user/item analysis.", difficulty: "Advanced" },
          { name: "Forecasting Model", description: "Time series forecasting with robust validation.", difficulty: "Advanced" },
        ],
        resources: [
          { name: "Kaggle Learn", type: "course", provider: "Kaggle", url: "https://www.kaggle.com/learn" },
        ],
        certification: { name: "IBM Data Science", provider: "IBM" },
      },
      {
        title: "Deployment + Monitoring",
        goal: "Turn models into services and maintain performance",
        topics: ["Model serving basics", "Versioning", "Monitoring drift", "Serving evaluation"],
        projects: [
          { name: "Deployed ML API", description: "Deploy a model as an API with monitoring hooks.", difficulty: "Advanced" },
        ],
        resources: [
          { name: "Made With ML", type: "course", provider: "Made With ML", url: "https://madewithml.com/" },
        ],
        certification: null,
      },
      {
        title: "Data Science Interview Readiness",
        goal: "Prepare for ML/DS interviews with practical case studies",
        topics: ["Interview case prep", "Metric tradeoffs", "Model interpretation", "Communication"],
        projects: [
          { name: "DS Portfolio Case Studies", description: "Write up end-to-end model stories with clear metrics.", difficulty: "Advanced" },
        ],
        resources: [
          { name: "Andrew Ng Courses", type: "course", provider: "Coursera", url: "https://www.coursera.org" },
        ],
        certification: { name: "Google Advanced Data Analytics", provider: "Google / Coursera", month: 6 },
      },
    ],
    jobReadinessMonth: 6,
    certifications: [
      { name: "IBM Data Science", provider: "IBM", month: 4 },
      { name: "Google Advanced Data Analytics", provider: "Google / Coursera", month: 6 },
    ],
  },

  ai_ml: {
    title: "Your Path To AI / ML Engineer",
    stages: [
      {
        title: "Python + ML Foundations",
        goal: "Create a solid programming + ML fundamentals base",
        topics: ["Python", "Statistics essentials", "ML workflow", "Data preparation"],
        projects: [
          { name: "AI Assistant Prompt Starter", description: "A prompt/notes system to practice text workflows.", difficulty: "Beginner" },
        ],
        resources: [
          { name: "Python Official Tutorial", type: "docs", provider: "Python", url: "https://docs.python.org/3/tutorial/" },
        ],
        certification: null,
      },
      {
        title: "Machine Learning (Core Models)",
        goal: "Train, evaluate, and improve ML models for real tasks",
        topics: ["Supervised learning", "Classification/regression", "Evaluation metrics", "Feature engineering"],
        projects: [
          { name: "Image Classifier", description: "Train and evaluate an image classifier with meaningful metrics.", difficulty: "Intermediate" },
        ],
        resources: [
          { name: "fast.ai Practical Deep Learning", type: "course", provider: "fast.ai", url: "https://course.fast.ai/" },
        ],
        certification: null,
      },
      {
        title: "Deep Learning",
        goal: "Build neural networks for vision and sequence problems",
        topics: ["TensorFlow basics", "PyTorch basics", "Transfer learning", "GPU training concepts"],
        projects: [
          { name: "Image Classifier (Fine-tune)", description: "Fine-tune a pre-trained model and compare results.", difficulty: "Advanced" },
        ],
        resources: [
          { name: "PyTorch Tutorials", type: "docs", provider: "PyTorch", url: "https://pytorch.org/tutorials/" },
        ],
        certification: { name: "Deep Learning Specialization", provider: "Coursera / DeepLearning.AI" },
      },
      {
        title: "NLP + LLM Applications",
        goal: "Build text workflows including RAG/prompting fundamentals",
        topics: ["Text preprocessing", "Embeddings", "Prompt engineering", "RAG"],
        projects: [
          { name: "Chatbot", description: "A RAG-based chatbot for document Q&A.", difficulty: "Advanced" },
        ],
        resources: [
          { name: "Hugging Face Course", type: "course", provider: "Hugging Face", url: "https://huggingface.co/learn" },
          { name: "OpenAI Cookbook", type: "docs", provider: "OpenAI", url: "https://cookbook.openai.com" },
        ],
        certification: { name: "Machine Learning Specialization", provider: "Coursera / DeepLearning.AI" },
      },
      {
        title: "MLOps + Deployment",
        goal: "Package models for production-like environments",
        topics: ["MLOps", "Docker", "Monitoring", "Model versioning"],
        projects: [
          { name: "AI Assistant Deployment", description: "Deploy an AI service with evaluation and monitoring steps.", difficulty: "Advanced" },
        ],
        resources: [
          { name: "MLOps Zoomcamp", type: "course", provider: "DataTalks.Club", url: "https://github.com/DataTalksClub/mlops-zoomcamp" },
        ],
        certification: null,
      },
      {
        title: "AI Interview + Portfolio",
        goal: "Prepare for AI roles with strong storytelling and evaluation",
        topics: ["Evaluation", "Responsible AI", "System tradeoffs", "Interview practice"],
        projects: [
          { name: "AI Assistant Capstone", description: "End-to-end AI assistant portfolio with measurable results.", difficulty: "Advanced" },
        ],
        resources: [
          { name: "Made With ML", type: "course", provider: "Made With ML", url: "https://madewithml.com/" },
        ],
        certification: null,
      },
    ],
    jobReadinessMonth: 6,
    certifications: [
      { name: "Machine Learning Specialization", provider: "Coursera / DeepLearning.AI", month: 2 },
      { name: "Deep Learning Specialization", provider: "Coursera / DeepLearning.AI", month: 3 },
    ],
  },

  devops: {
    title: "Your Path To DevOps Engineer",
    stages: [
      {
        title: "Linux + Networking",
        goal: "Understand Linux fundamentals and operational debugging",
        topics: ["Linux basics", "Processes & permissions", "Networking basics", "Shell scripting"],
        projects: [
          { name: "Docker Deployment", description: "Containerize a small app and run it consistently.", difficulty: "Beginner" },
        ],
        resources: [
          { name: "Linux Journey", type: "course", provider: "Linux Journey", url: "https://linuxjourney.com/" },
        ],
        certification: null,
      },
      {
        title: "Docker + Containers",
        goal: "Build images and orchestrate services with Docker",
        topics: ["Dockerfile", "Images/containers", "Volumes & networking", "Security basics"],
        projects: [
          { name: "Docker Deployment", description: "Multi-stage Docker builds and environment configurations.", difficulty: "Intermediate" },
        ],
        resources: [
          { name: "Docker Docs", type: "docs", provider: "Docker", url: "https://docs.docker.com/" },
        ],
        certification: { name: "Docker Certification", provider: "Docker / Community" },
      },
      {
        title: "CI/CD Pipelines",
        goal: "Automate testing, builds, and deployments",
        topics: ["CI", "CD", "Build pipelines", "Artifacts"],
        projects: [
          { name: "CI/CD Pipeline", description: "Create a pipeline that runs tests and deploys automatically.", difficulty: "Intermediate" },
        ],
        resources: [
          { name: "GitHub Actions Docs", type: "docs", provider: "GitHub", url: "https://docs.github.com/actions" },
        ],
        certification: null,
      },
      {
        title: "Kubernetes Basics",
        goal: "Deploy services using Kubernetes concepts",
        topics: ["Kubernetes pods", "Deployments", "Services", "Ingress"],
        projects: [
          { name: "Kubernetes Cluster", description: "Deploy apps to a local cluster and validate configs.", difficulty: "Advanced" },
        ],
        resources: [
          { name: "Kubernetes Docs", type: "docs", provider: "Kubernetes", url: "https://kubernetes.io/docs/" },
        ],
        certification: null,
      },
      {
        title: "Cloud + Reliability",
        goal: "Operate systems on cloud with reliability best practices",
        topics: ["AWS basics", "Monitoring", "Logging", "SRE mindset"],
        projects: [
          { name: "Production-Style Monitoring", description: "Set up dashboards and alerts for app health.", difficulty: "Advanced" },
        ],
        resources: [
          { name: "AWS Training", type: "course", provider: "AWS", url: "https://www.aws.training/" },
        ],
        certification: { name: "AWS Cloud Practitioner", provider: "Amazon" },
      },
      {
        title: "DevOps Portfolio + Interview Readiness",
        goal: "Present a portfolio aligned with DevOps role expectations",
        topics: ["Troubleshooting", "Postmortems", "Incident response", "Interview practice"],
        projects: [
          { name: "DevOps Capstone", description: "End-to-end pipeline + deployment + monitoring for a sample service.", difficulty: "Advanced" },
        ],
        resources: [
          { name: "SRE Book Notes", type: "book", provider: "Google", url: "https://sre.google/books/" },
        ],
        certification: null,
      },
    ],
    jobReadinessMonth: 6,
    certifications: [
      { name: "AWS Cloud Practitioner", provider: "Amazon", month: 5 },
      { name: "Docker Certification", provider: "Docker / Community", month: 2 },
    ],
  },

  python: {
    title: "Your Path To Python Developer",
    stages: [
      {
        title: "Python Fundamentals",
        goal: "Master Python syntax and build confidence through small scripts",
        topics: ["Data types", "Functions", "OOP basics", "Virtual environments"],
        projects: [
          { name: "CLI Utility Tool", description: "A practical CLI tool (file organizer/budget tracker style).", difficulty: "Beginner" },
        ],
        resources: [
          { name: "Python Official Tutorial", type: "docs", provider: "Python", url: "https://docs.python.org/3/tutorial/" },
        ],
        certification: null,
      },
      {
        title: "APIs + Automation",
        goal: "Build API clients and automate workflows",
        topics: ["requests", "auth basics", "error handling", "automation patterns"],
        projects: [
          { name: "API Data Fetcher", description: "Fetch, validate, and store data from public APIs.", difficulty: "Intermediate" },
        ],
        resources: [
          { name: "Requests Docs", type: "docs", provider: "Python Requests", url: "https://requests.readthedocs.io/" },
        ],
        certification: null,
      },
      {
        title: "Testing + Quality",
        goal: "Write maintainable Python with tests and clean code",
        topics: ["pytest basics", "type hints", "linting", "CI basics"],
        projects: [
          { name: "Tested Module Library", description: "Create a small reusable library with full tests.", difficulty: "Intermediate" },
        ],
        resources: [
          { name: "Pytest Docs", type: "docs", provider: "pytest", url: "https://docs.pytest.org/" },
        ],
        certification: null,
      },
      {
        title: "Data Analysis with Pandas",
        goal: "Analyze data and build repeatable notebook pipelines",
        topics: ["Pandas", "NumPy", "Data cleaning", "Visualization basics"],
        projects: [
          { name: "Data Cleaning Pipeline", description: "Automate data ingestion/cleaning/export for a dataset.", difficulty: "Advanced" },
        ],
        resources: [
          { name: "Pandas Docs", type: "docs", provider: "Pandas", url: "https://pandas.pydata.org/docs/" },
        ],
        certification: null,
      },
      {
        title: "Python Web (Optional)",
        goal: "Use Python for backend-style services",
        topics: ["REST concepts", "Flask/FastAPI overview", "Auth patterns", "Deployment"],
        projects: [
          { name: "Python Web Service", description: "A simple REST API with auth and validation.", difficulty: "Advanced" },
        ],
        resources: [
          { name: "FastAPI Docs", type: "docs", provider: "FastAPI", url: "https://fastapi.tiangolo.com/" },
        ],
        certification: null,
      },
      {
        title: "Portfolio + Interview Readiness",
        goal: "Present your Python projects and prepare for interviews",
        topics: ["Python coding interviews", "System design basics", "Debugging", "Communication"],
        projects: [
          { name: "Python Portfolio Suite", description: "Package your projects with documentation and demos.", difficulty: "Advanced" },
        ],
        resources: [
          { name: "CS50 Python", type: "course", provider: "Harvard", url: "https://cs50.harvard.edu/python/" },
        ],
        certification: null,
      },
    ],
    jobReadinessMonth: 5,
    certifications: [],
  },
};

const resolveTemplate = (role) => {
  const key = detectRoleTemplateKey(role);
  return key ? ROLE_ROADMAPS[key] : null;
};

const ensureNonEmptyArray = (arr) => (Array.isArray(arr) && arr.length ? arr : []);

const deterministicUnknownRoleStages = (role) => {
  const safeRole = (role || "").trim() || "your target role";
  return [
    {
      title: "Beginner Ramp-Up",
      goal: `Understand the core fundamentals for ${safeRole}`,
      topics: [
        "Core concepts",
        "Tooling & setup",
        "Basic workflows",
        "Project-based learning",
      ],
      projects: [
        {
          name: `Starter Project: ${safeRole} Basics`,
          description:
            "Build a small end-to-end mini-project to validate fundamentals.",
          difficulty: "Beginner",
        },
      ],
      resources: [
        {
          name: "General Learning Path",
          type: "docs",
          provider: "CareerPilot",
          url: "https://example.com",
        },
      ],
      certification: null,
    },
    {
      title: "Intermediate Skill Building",
      goal: `Develop practical skills for ${safeRole}`,
      topics: [
        "Advanced fundamentals",
        "Patterns & best practices",
        "Testing/quality basics",
        "Debugging",
      ],
      projects: [
        {
          name: `Intermediate Project: ${safeRole} Workshop`,
          description:
            "Ship a feature-complete project and document tradeoffs + decisions.",
          difficulty: "Intermediate",
        },
      ],
      resources: [
        {
          name: "Learning Resources",
          type: "course",
          provider: "freeCodeCamp",
          url: "https://www.freecodecamp.org",
        },
      ],
      certification: null,
    },
    {
      title: "Advanced Capstone",
      goal: `Deliver a portfolio-ready capstone for ${safeRole}`,
      topics: [
        "Production-like architecture",
        "Performance & security",
        "Observability/monitoring",
        "End-to-end deployment",
      ],
      projects: [
        {
          name: `Capstone: ${safeRole} Portfolio`,
          description:
            "Build a portfolio capstone with deployment, documentation, and a measurable outcome.",
          difficulty: "Advanced",
        },
      ],
      resources: [
        {
          name: "Deployment & Quality",
          type: "docs",
          provider: "web.dev",
          url: "https://web.dev/learn/",
        },
      ],
      certification: null,
    },
    {
      title: "Projects, Certifications & Interview Prep",
      goal: `Prepare to interview and present your ${safeRole} work`,
      topics: [
        "Interview questions",
        "Mock interviews",
        "Resume/portfolio polish",
        "System design basics",
      ],
      projects: [
        {
          name: "Interview-Ready Demo",
          description:
            "Create a narrated walkthrough of your capstone with decisions + tradeoffs.",
          difficulty: "Advanced",
        },
      ],
      resources: [
        {
          name: "Practice Platform",
          type: "practice",
          provider: "Pramp",
          url: "https://www.pramp.com",
        },
      ],
      certification: null,
    },
  ];
};

const deterministicRoleStages = (templateKey, role) => {
  // Uses existing static templates when we can detect the role key.
  const template = templateKey ? ROLE_ROADMAPS[templateKey] : null;
  if (template) {
    return buildStages(template.stages);
  }
  // Unknown => 4-stage deterministic generic.
  const defaultStages = deterministicUnknownRoleStages(role);
  return buildStages(defaultStages);
};

const parseRoadmapJson = (text) => {
  // Try strict JSON first.
  try {
    const obj = JSON.parse(text);
    return obj;
  } catch (e) {
    // Try to extract the first JSON object from the text.
    const match = text && text.match(/\{[\s\S]*\}/);
    if (!match) throw e;
    return JSON.parse(match[0]);
  }
};

const normalizeAIResponseToSchema = (aiObj, role) => {
  // Ensure response structure matches existing controller expectations.
  const title = aiObj?.title || `Your Path To ${String(role || "Role").trim()}`;
  const stagesRaw = Array.isArray(aiObj?.stages) ? aiObj.stages : [];

  // Coerce stages into required stage object shape. Ensure non-empty arrays.
  const stages = stagesRaw
    .slice(0, 6)
    .map((s, idx) => ({
      month: idx + 1,
      title: s?.title || `Stage ${idx + 1}`,
      goal: s?.goal || "",
      topics: ensureNonEmptyArray(s?.topics),
      projects: ensureNonEmptyArray(s?.projects),
      resources: ensureNonEmptyArray(s?.resources),
      certification: s?.certification ?? null,
    }));

  // If AI returns fewer than 4 stages, fill deterministically to avoid empty responses.
  if (stages.length === 0) {
    const fallback = deterministicRoleStages(detectRoleTemplateKey(role), role);
    return {
      role: (role || "").trim(),
      title,
      roadmap: fallback.map((s) => s.title),
      stages: fallback,
      meta: {
        estimatedMonths: fallback.length,
        jobReadinessMonth: fallback.length,
        totalTopics: fallback.reduce((sum, s) => sum + (s.topics?.length || 0), 0),
        totalProjects: fallback.reduce((sum, s) => sum + (s.projects?.length || 0), 0),
        totalResources: fallback.reduce((sum, s) => sum + (s.resources?.length || 0), 0),
        certifications: [],
      },
    };
  }

  const roadmap = stages.map((s) => s.title);
  const totalTopics = stages.reduce((sum, s) => sum + (s.topics?.length || 0), 0);
  const totalProjects = stages.reduce((sum, s) => sum + (s.projects?.length || 0), 0);
  const totalResources = stages.reduce((sum, s) => sum + (s.resources?.length || 0), 0);

  return {
    role: (role || "").trim(),
    title,
    roadmap,
    stages,
    meta: {
      estimatedMonths: stages.length,
      jobReadinessMonth: aiObj?.jobReadinessMonth || stages.length,
      totalTopics,
      totalProjects,
      totalResources,
      certifications: ensureNonEmptyArray(aiObj?.certifications),
    },
  };
};

const generateRoadmapWithAI = async (role) => {
  const safeRole = (role || "").trim();

  if (!process.env.OPENROUTER_API_KEY) {
    // Key missing: avoid calling OpenAI client entirely.
    throw new Error("OPENROUTER_API_KEY not set");
  }

  const prompt = `You are CareerPilot, an expert career coach.

Generate a role-based learning roadmap for the following target role:
ROLE: ${safeRole}

Return ONLY valid JSON with the following schema:
{
  "title": string,
  "jobReadinessMonth": number,
  "certifications": [ {"name": string, "provider": string, "month": number} ],
  "stages": [
    {
      "title": string,
      "goal": string,
      "topics": string[],
      "projects": [ {"name": string, "description": string, "difficulty": string} ],
      "resources": [ {"name": string, "type": string, "provider": string, "url": string} ],
      "certification": {"name": string, "provider": string } | null
    }
  ]
}

Guidelines:
- Provide 4 to 6 stages.
- Each stage must include topics, projects, resources arrays (can be 1+ items).
- Keep content practical for job readiness.
- Ensure JSON is parseable. No markdown, no extra keys.`;

  const completion = await aiClient.chat.completions.create({
    // Model choice works via OpenRouter; keep it generic.
    model: "openai/gpt-4o-mini",
    messages: [
      { role: "system", content: "Return only valid JSON." },
      { role: "user", content: prompt },
    ],
    temperature: 0.4,
  });

  const content = completion?.choices?.[0]?.message?.content;
  const parsed = parseRoadmapJson(content);
  return normalizeAIResponseToSchema(parsed, role);
};

const buildResultFromStages = ({
  role,
  stages,
  jobReadinessMonth,
  certifications = [],
}) => {
  const roadmap = stages.map((s) => s.title);
  const totalTopics = stages.reduce((sum, s) => sum + (s.topics?.length || 0), 0);
  const totalProjects = stages.reduce((sum, s) => sum + (s.projects?.length || 0), 0);
  const totalResources = stages.reduce((sum, s) => sum + (s.resources?.length || 0), 0);

  return {
    success: true,
    role: role.trim(),
    roadmap,
    stages,
    meta: {
      estimatedMonths: stages.length,
      jobReadinessMonth: jobReadinessMonth || stages.length,
      totalTopics,
      totalProjects,
      totalResources,
      certifications,
    },
  };
};

const buildTemplateResult = (role, template) =>
  buildResultFromStages({
    role,
    stages: buildStages(template.stages),
    jobReadinessMonth: template.jobReadinessMonth,
    certifications: template.certifications || [],
  });

const buildFallbackResult = (role) => {
  const templateKey = detectRoleTemplateKey(role);
  return buildResultFromStages({
    role,
    stages: deterministicRoleStages(templateKey, role),
    jobReadinessMonth: undefined,
    certifications: [],
  });
};

const persistRoadmap = async (userId, result) => {
  return RoadmapHistory.create({
    user: userId,
    role: result.role,
    stagesCount: result.stages.length,
    estimatedMonths: result.meta?.estimatedMonths || result.stages.length,
    jobReadinessMonth: result.meta?.jobReadinessMonth || result.stages.length,
    milestones: result.roadmap,
    roadmap: result.roadmap,
    stages: result.stages,
    meta: result.meta || {},
  });
};

const serializeRoadmapHistory = (record) => {
  if (!record) return null;

  return {
    _id: record._id,
    role: record.role,
    roadmap: record.roadmap?.length ? record.roadmap : record.milestones,
    stages: record.stages || [],
    meta: record.meta || {
      estimatedMonths: record.estimatedMonths,
      jobReadinessMonth: record.jobReadinessMonth,
      certifications: [],
    },
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
};

const generateRoadmapForRole = async (role) => {
  const template = resolveTemplate(role);
  if (template) return buildTemplateResult(role, template);

  try {
    const aiResult = await generateRoadmapWithAI(role);
    return {
      success: true,
      role: role.trim(),
      roadmap: aiResult.roadmap,
      stages: aiResult.stages,
      meta: {
        estimatedMonths: aiResult.meta.estimatedMonths,
        jobReadinessMonth: aiResult.meta.jobReadinessMonth,
        totalTopics: aiResult.meta.totalTopics,
        totalProjects: aiResult.meta.totalProjects,
        totalResources: aiResult.meta.totalResources,
        certifications: aiResult.meta.certifications || [],
      },
    };
  } catch (err) {
    console.error("AI roadmap generation failed:", err?.message || err);
    return buildFallbackResult(role);
  }
};

module.exports = {
  generateRoadmap: async (req, res) => {
    try {
      const { role } = req.body;
      const userId = req.user.id;

      if (!role || !role.trim()) {
        return res.status(400).json({ success: false, message: "Role is required" });
      }

      const result = await generateRoadmapForRole(role.trim());
      const saved = await persistRoadmap(userId, result);

      return res.status(200).json({
        ...result,
        _id: saved._id,
      });
    } catch (error) {
      console.error("Roadmap generation fatal error:", error?.message || error);
      const role = (req.body?.role || "").trim() || "your target role";
      const result = buildResultFromStages({
        role,
        stages: buildStages(deterministicUnknownRoleStages(role)),
      });

      try {
        const saved = await persistRoadmap(req.user.id, result);
        return res.status(200).json({ ...result, _id: saved._id });
      } catch (persistError) {
        console.error("Roadmap persistence failed:", persistError?.message || persistError);
      }

      return res.status(500).json({
        success: false,
        message: "Failed to generate roadmap",
      });
    }
  },

  getHistory: async (req, res) => {
    try {
      const roadmaps = await RoadmapHistory.find({ user: req.user.id })
        .sort({ updatedAt: -1, createdAt: -1 })
        .limit(20);

      return res.status(200).json({
        success: true,
        roadmaps: roadmaps.map(serializeRoadmapHistory),
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  getLatestRoadmap: async (req, res) => {
    try {
      const roadmap = await RoadmapHistory.findOne({ user: req.user.id })
        .sort({ updatedAt: -1, createdAt: -1 });

      return res.status(200).json({
        success: true,
        roadmap: serializeRoadmapHistory(roadmap),
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  updateRoadmap: async (req, res) => {
    try {
      const allowed = {};
      ["role", "roadmap", "stages", "meta"].forEach((field) => {
        if (req.body[field] !== undefined) allowed[field] = req.body[field];
      });

      if (Array.isArray(allowed.roadmap)) {
        allowed.milestones = allowed.roadmap;
      }

      if (Array.isArray(allowed.stages)) {
        allowed.stagesCount = allowed.stages.length;
      }

      if (allowed.meta) {
        allowed.estimatedMonths = allowed.meta.estimatedMonths;
        allowed.jobReadinessMonth = allowed.meta.jobReadinessMonth;
      }

      const roadmap = await RoadmapHistory.findOneAndUpdate(
        { _id: req.params.id, user: req.user.id },
        { $set: allowed },
        { new: true, runValidators: true }
      );

      if (!roadmap) {
        return res.status(404).json({
          success: false,
          message: "Roadmap not found",
        });
      }

      return res.status(200).json({
        success: true,
        roadmap: serializeRoadmapHistory(roadmap),
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
};

