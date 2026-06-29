const fs = require("fs");
const pdfParse = require("pdf-parse");

const Resume = require("../models/Resume");
const { analyzeAts } = require("../utils/atsAnalyzer");

const analyzeResume = async (req, res) => {
  let filePath = null;

  try {
    const { jobDescription } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume file is required",
      });
    }

    if (!jobDescription?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Job description is required",
      });
    }

    filePath = req.file.path;
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const resumeText = pdfData.text;

    if (!resumeText?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Could not extract text from PDF. Ensure the resume is text-based, not scanned images.",
      });
    }

    const analysis = analyzeAts(resumeText, jobDescription);

    const resume = await Resume.create({
      user: req.user.id,
      fileName: req.file.originalname,
      resumeText: resumeText.toLowerCase(),
      atsScore: analysis.atsScore,
      skills: analysis.matchedSkills,
      missingKeywords: analysis.missingKeywords,
    });

    res.status(200).json({
      success: true,
      fileName: req.file.originalname,
      ...analysis,
      resumeId: resume._id,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

module.exports = {
  analyzeResume,
};
