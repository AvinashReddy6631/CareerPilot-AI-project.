
const ResumeBuilder = require(
  "../models/ResumeBuilder"
);

const createResume = async (
  req,
  res
) => {
  try {
    const {
      name,
      email,
      phone,
      skills,
      education,
      experience,
      projects,
      responsibilities,
      achievements,
      template,
    } = req.body;

    let summary = "";

    if (
      template === "ATS Standard"
    ) {
      summary = `Results-driven professional with expertise in ${skills}. Strong foundation in technical and problem-solving skills with a focus on delivering quality results.`;
    }

    if (
      template === "Professional"
    ) {
      summary = `Experienced professional with a strong background in ${skills}. Proven ability to work collaboratively, manage projects, and contribute to organizational success.`;
    }

    if (
      template === "Modern"
    ) {
      summary = `Creative and innovative professional skilled in ${skills}. Passionate about building impactful solutions and continuously learning new technologies.`;
    }

    const resume =
      await ResumeBuilder.create({
        name,
        email,
        phone,
        skills,
        education,
        experience,
        projects,
        responsibilities,
        achievements,
        template,
        summary,
      });

    res.status(201).json({
      success: true,
      resume,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createResume,
};