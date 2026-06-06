const generateRoadmap = async (req, res) => {
  try {
    const { role } = req.body;

    let roadmap = [];

    if (role.toLowerCase().includes("frontend")) {
      roadmap = [
        "HTML, CSS, JavaScript",
        "React.js",
        "State Management",
        "API Integration",
        "Projects & Portfolio",
        "Internship Preparation",
      ];
    } else if (role.toLowerCase().includes("ai")) {
      roadmap = [
        "Python",
        "Statistics",
        "Machine Learning",
        "Deep Learning",
        "NLP & LLMs",
        "AI Projects",
      ];
    } else {
      roadmap = [
        "Programming Fundamentals",
        "Data Structures",
        "Projects",
        "Internship Preparation",
      ];
    }

    res.status(200).json({
      success: true,
      role,
      roadmap,
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