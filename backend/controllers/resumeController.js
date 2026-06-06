const fs = require("fs");
const pdfParse = require("pdf-parse");

const Resume = require("../models/Resume");

const analyzeResume = async (req, res) => {
  try {
    const { jobDescription } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume file is required",
      });
    }

    const dataBuffer = fs.readFileSync(req.file.path);

    const pdfData = await pdfParse(dataBuffer);

    const resumeText = pdfData.text.toLowerCase();

    const skillKeywords = [
      "html",
      "css",
      "javascript",
      "react",
      "next.js",
      "node.js",
      "express",
      "mongodb",
      "mysql",
      "git",
      "github",
      "tailwind css",
      "bootstrap",
      "python",
      "java",
      "c",
      "flask",
      "rest api",
      "responsive design",
      "ui/ux",
      "problem solving",
      "team collaboration",
      "communication",
    ];

    const jdText = (jobDescription || "").toLowerCase();

    const requiredSkills = skillKeywords.filter(
      (skill) => jdText.includes(skill)
    );

    const matchedSkills = requiredSkills.filter(
      (skill) => resumeText.includes(skill)
    );

    const missingSkills = requiredSkills.filter(
      (skill) => !resumeText.includes(skill)
    );

    const atsScore =
      requiredSkills.length > 0
        ? Math.round(
            (matchedSkills.length /
              requiredSkills.length) *
              100
          )
        : 0;

    const resume = await Resume.create({
      fileName: req.file.originalname,
      resumeText,
      atsScore,
      skills: matchedSkills,
      missingKeywords: missingSkills,
    });

    res.status(200).json({
      success: true,
      atsScore,
      matchedSkills,
      missingSkills,
      totalKeywords:
        requiredSkills.length,
      matchedCount:
        matchedSkills.length,
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
  analyzeResume,
};