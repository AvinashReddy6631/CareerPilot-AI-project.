const SOURCES = ["linkedin", "internshala", "unstop", "indeed", "naukri"];

const buildApplyUrl = (source, role, company, location) => {
  const q = encodeURIComponent(`${role} ${company}`);
  const loc = encodeURIComponent(location.split(",")[0].trim());

  switch (source) {
    case "linkedin":
      return `https://www.linkedin.com/jobs/search/?keywords=${q}&location=${loc}`;
    case "indeed":
      return `https://in.indeed.com/jobs?q=${q}&l=${loc}`;
    case "naukri":
      return `https://www.naukri.com/${role.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-jobs-in-${loc.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    case "internshala":
      return `https://internshala.com/internships/${role.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-internship`;
    case "unstop":
      return `https://unstop.com/jobs?search=${q}`;
    default:
      return `https://www.google.com/search?q=${q}+jobs+${loc}`;
  }
};

const RAW_LISTINGS = [
  { source: "linkedin", type: "job", company: "Flipkart", role: "Software Development Engineer", location: "Bangalore, Karnataka", salary: "₹18–28 LPA", skills: ["java", "spring boot", "microservices", "sql"], description: "Build scalable e-commerce systems. Requires Java, Spring Boot, REST APIs, and strong DSA fundamentals. 0–2 years experience." },
  { source: "linkedin", type: "job", company: "Razorpay", role: "Frontend Developer", location: "Bangalore, Karnataka", salary: "₹12–20 LPA", skills: ["react", "typescript", "javascript", "css"], description: "Develop payment dashboard UIs with React and TypeScript. Knowledge of responsive design and REST API integration required." },
  { source: "linkedin", type: "job", company: "Swiggy", role: "Backend Developer", location: "Bangalore, Karnataka", salary: "₹14–22 LPA", skills: ["node.js", "mongodb", "redis", "rest api"], description: "Work on high-traffic food delivery backend. Node.js, MongoDB, Redis, and system design basics expected." },
  { source: "linkedin", type: "job", company: "PhonePe", role: "Android Developer", location: "Bangalore, Karnataka", salary: "₹15–24 LPA", skills: ["java", "kotlin", "android"], description: "Build fintech Android apps. Kotlin/Java, MVVM architecture, and API integration experience preferred." },
  { source: "linkedin", type: "job", company: "Zomato", role: "Data Analyst", location: "Gurgaon, Haryana", salary: "₹8–14 LPA", skills: ["sql", "python", "excel"], description: "Analyse restaurant and delivery metrics. SQL, Python, Excel, and dashboard tools like Metabase or Tableau." },
  { source: "naukri", type: "job", company: "TCS", role: "Graduate Trainee", location: "Pune, Maharashtra", salary: "₹3.5–4.5 LPA", skills: ["java", "sql", "communication"], description: "Campus hire for IT services. Training in Java, SQL, and client projects. Open to 2024–2025 graduates." },
  { source: "naukri", type: "job", company: "Infosys", role: "Systems Engineer", location: "Mysore, Karnataka", salary: "₹4–5 LPA", skills: ["java", "python", "sql"], description: "Entry-level engineering role. Strong programming fundamentals, willingness to learn, and good communication." },
  { source: "naukri", type: "job", company: "Wipro", role: "Project Engineer", location: "Hyderabad, Telangana", salary: "₹4–5.5 LPA", skills: ["java", "javascript", "sql"], description: "Join digital transformation projects. Java or JavaScript, database basics, and teamwork skills required." },
  { source: "naukri", type: "job", company: "HCL Tech", role: "Software Engineer", location: "Noida, Uttar Pradesh", salary: "₹5–8 LPA", skills: ["c++", "java", "sql"], description: "Develop enterprise software solutions. C++/Java, OOP concepts, and problem-solving ability." },
  { source: "naukri", type: "job", company: "Cognizant", role: "Programmer Analyst", location: "Chennai, Tamil Nadu", salary: "₹4.5–6 LPA", skills: ["java", "sql", "agile"], description: "Work on global client deliverables. Java, SQL, SDLC knowledge, and agile exposure helpful." },
  { source: "indeed", type: "job", company: "Amazon", role: "SDE-1", location: "Hyderabad, Telangana", salary: "₹20–35 LPA", skills: ["java", "data structures", "algorithms", "aws"], description: "Build AWS-scale services. Strong DSA, Java/Python, and object-oriented design. 0–2 years." },
  { source: "indeed", type: "job", company: "Microsoft", role: "Software Engineer", location: "Bangalore, Karnataka", salary: "₹22–40 LPA", skills: ["c++", "algorithms", "azure"], description: "Contribute to cloud and productivity products. C++/C#, algorithms, and passion for technology." },
  { source: "indeed", type: "job", company: "Google", role: "Software Engineer", location: "Bangalore, Karnataka", salary: "₹25–45 LPA", skills: ["algorithms", "data structures", "python", "java"], description: "Solve complex engineering problems. Excellent DSA, coding skills, and CS fundamentals." },
  { source: "indeed", type: "job", company: "Freshworks", role: "Full Stack Developer", location: "Chennai, Tamil Nadu", salary: "₹10–18 LPA", skills: ["react", "node.js", "mongodb", "javascript"], description: "Build SaaS features end-to-end. React, Node.js, MongoDB, and REST API experience." },
  { source: "indeed", type: "job", company: "Zoho", role: "Product Developer", location: "Chennai, Tamil Nadu", salary: "₹8–15 LPA", skills: ["java", "javascript", "sql"], description: "Develop business software products. Strong logic, Java/JavaScript, and database skills." },
  { source: "unstop", type: "job", company: "CRED", role: "Backend Engineer", location: "Bangalore, Karnataka", salary: "₹18–30 LPA", skills: ["java", "kotlin", "microservices", "sql"], description: "Build fintech backend at scale. Java/Kotlin, distributed systems, and API design." },
  { source: "unstop", type: "job", company: "Meesho", role: "Frontend Engineer", location: "Bangalore, Karnataka", salary: "₹12–20 LPA", skills: ["react", "javascript", "typescript", "css"], description: "Build seller and buyer experiences. React, performance optimisation, and mobile-first UI." },
  { source: "unstop", type: "job", company: "Dream11", role: "iOS Developer", location: "Mumbai, Maharashtra", salary: "₹14–22 LPA", skills: ["swift", "ios", "rest api"], description: "Develop fantasy sports iOS app. Swift, UIKit/SwiftUI, and API integration." },
  { source: "unstop", type: "job", company: "ShareChat", role: "ML Engineer", location: "Bangalore, Karnataka", salary: "₹16–28 LPA", skills: ["python", "machine learning", "sql"], description: "Build recommendation systems. Python, ML fundamentals, and data pipeline experience." },
  { source: "unstop", type: "job", company: "Curefit", role: "DevOps Engineer", location: "Bangalore, Karnataka", salary: "₹12–20 LPA", skills: ["docker", "kubernetes", "aws", "ci/cd"], description: "Manage cloud infrastructure. Docker, K8s, AWS, and CI/CD pipelines." },
  { source: "internshala", type: "internship", company: "Paytm", role: "SDE Intern", location: "Noida, Uttar Pradesh", salary: "₹35,000/month", skills: ["java", "javascript", "sql"], description: "6-month internship on payment systems. Java or JavaScript, Git, and eagerness to learn." },
  { source: "internshala", type: "internship", company: "Ola", role: "Data Science Intern", location: "Bangalore, Karnataka", salary: "₹30,000/month", skills: ["python", "machine learning", "sql"], description: "Work on mobility analytics. Python, pandas, basic ML, and SQL skills." },
  { source: "internshala", type: "internship", company: "Nykaa", role: "Frontend Intern", location: "Mumbai, Maharashtra", salary: "₹25,000/month", skills: ["react", "html", "css", "javascript"], description: "Build e-commerce UI components. React, HTML/CSS, and responsive design." },
  { source: "internshala", type: "internship", company: "Delhivery", role: "Backend Intern", location: "Gurgaon, Haryana", salary: "₹28,000/month", skills: ["python", "django", "sql"], description: "Logistics platform backend. Python, Django/Flask, and database basics." },
  { source: "internshala", type: "internship", company: "Razorpay", role: "Product Intern", location: "Bangalore, Karnataka", salary: "₹30,000/month", skills: ["communication", "analytical", "sql"], description: "Support product team with research and analysis. Good communication and analytical thinking." },
  { source: "linkedin", type: "internship", company: "Adobe", role: "Software Intern", location: "Noida, Uttar Pradesh", salary: "₹50,000/month", skills: ["c++", "java", "algorithms"], description: "Summer internship on creative cloud products. Strong coding and CS fundamentals." },
  { source: "linkedin", type: "internship", company: "Intuit", role: "Full Stack Intern", location: "Bangalore, Karnataka", salary: "₹45,000/month", skills: ["react", "node.js", "javascript"], description: "Build features for TurboTax/QuickBooks. React, Node.js, and agile teamwork." },
  { source: "unstop", type: "internship", company: "Samsung", role: "R&D Intern", location: "Bangalore, Karnataka", salary: "₹40,000/month", skills: ["c++", "python", "algorithms"], description: "Research internship in mobile tech. C++/Python and strong academic record." },
  { source: "unstop", type: "internship", company: "JP Morgan", role: "Technology Intern", location: "Mumbai, Maharashtra", salary: "₹60,000/month", skills: ["java", "sql", "problem solving"], description: "Banking technology internship. Java, SQL, and interest in finance tech." },
  { source: "unstop", type: "internship", company: "Goldman Sachs", role: "Engineering Intern", location: "Bangalore, Karnataka", salary: "₹65,000/month", skills: ["java", "algorithms", "data structures"], description: "Quant and engineering internship. Excellent DSA and Java/C++ skills." },
  { source: "indeed", type: "internship", company: "IBM", role: "Cloud Intern", location: "Bangalore, Karnataka", salary: "₹35,000/month", skills: ["python", "aws", "docker"], description: "Cloud and AI internship. Python, cloud basics, and willingness to get certified." },
  { source: "indeed", type: "internship", company: "SAP", role: "Developer Intern", location: "Bangalore, Karnataka", salary: "₹32,000/month", skills: ["java", "sql", "javascript"], description: "Enterprise software internship. Java, SQL, and logical problem solving." },
  { source: "naukri", type: "internship", company: "Capgemini", role: "Graduate Intern", location: "Pune, Maharashtra", salary: "₹20,000/month", skills: ["java", "communication", "sql"], description: "Trainee internship leading to full-time. Java basics and good academics." },
  { source: "naukri", type: "internship", company: "Accenture", role: "Technology Intern", location: "Hyderabad, Telangana", salary: "₹22,000/month", skills: ["java", "python", "sql"], description: "Consulting tech internship. Programming fundamentals and team collaboration." },
  { source: "linkedin", type: "job", company: "Juspay", role: "Software Engineer", location: "Bangalore, Karnataka", salary: "₹16–26 LPA", skills: ["java", "functional programming", "sql"], description: "Payments infrastructure engineering. Java/Haskell, strong fundamentals, and curiosity." },
  { source: "naukri", type: "job", company: "L&T Infotech", role: "Software Developer", location: "Mumbai, Maharashtra", salary: "₹5–9 LPA", skills: ["java", "angular", "sql"], description: "Enterprise app development. Java, Angular/React, and SQL knowledge." },
  { source: "internshala", type: "internship", company: "Groww", role: "Android Intern", location: "Bangalore, Karnataka", salary: "₹28,000/month", skills: ["kotlin", "android", "java"], description: "Fintech Android internship. Kotlin, Android SDK, and API integration." },
  { source: "unstop", type: "job", company: "Postman", role: "Software Engineer", location: "Bangalore, Karnataka", salary: "₹18–28 LPA", skills: ["node.js", "react", "javascript", "typescript"], description: "API platform engineering. Node.js, React, TypeScript, and developer tools passion." },
  { source: "indeed", type: "job", company: "Dunzo", role: "React Developer", location: "Bangalore, Karnataka", salary: "₹10–16 LPA", skills: ["react", "redux", "javascript", "css"], description: "Hyperlocal delivery app frontend. React, state management, and mobile web." },
];

const CATALOG = RAW_LISTINGS.map((item, index) => ({
  id: `${item.source}-${String(index + 1).padStart(3, "0")}`,
  ...item,
  applyUrl: buildApplyUrl(item.source, item.role, item.company, item.location),
  postedDaysAgo: (index % 14) + 1,
  remote: item.location.toLowerCase().includes("remote"),
  experience: item.type === "internship" ? "Internship" : index % 3 === 0 ? "Fresher" : "0–2 years",
}));

const normalize = (text) => (text || "").toLowerCase().trim();

const searchJobs = ({ query = "", location = "", type = "", sources = [], page = 1, limit = 20 }) => {
  const q = normalize(query);
  const loc = normalize(location);
  const sourceFilter = sources.length ? sources.map(normalize) : SOURCES;

  let results = CATALOG.filter((job) => {
    if (type && job.type !== type) return false;
    if (!sourceFilter.includes(job.source)) return false;

    const haystack = normalize(
      `${job.company} ${job.role} ${job.location} ${job.description} ${job.skills.join(" ")}`
    );

    if (q && !haystack.includes(q) && !q.split(/\s+/).every((word) => haystack.includes(word))) {
      return false;
    }

    if (loc && !normalize(job.location).includes(loc)) return false;

    return true;
  });

  if (!q && !loc && !type) {
    results = [...CATALOG].filter((j) => sourceFilter.includes(j.source));
  }

  const total = results.length;
  const start = (page - 1) * limit;
  const paginated = results.slice(start, start + limit);

  return {
    jobs: paginated,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
    sources: SOURCES,
  };
};

const getJobById = (id) => CATALOG.find((j) => j.id === id) || null;

module.exports = {
  SOURCES,
  CATALOG,
  searchJobs,
  getJobById,
  buildApplyUrl,
};
