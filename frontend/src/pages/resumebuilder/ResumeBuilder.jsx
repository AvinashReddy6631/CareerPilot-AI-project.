
import { useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";

export default function ResumeBuilder() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    skills: "",
    education: "",
    experience: "",
    projects: "",
    responsibilities: "",
    achievements: "",
    template: "ATS Standard",
  });

  const [resume, setResume] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/resume-builder/create",
        formData
      );

      setResume(res.data.resume);
    } catch (error) {
      console.log(error);
    }
  };

  const downloadPDF = () => {
    if (!resume) return;

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text(resume.name || "", 20, 20);

    doc.setFontSize(12);
    doc.text(
      `${resume.email || ""} | ${resume.phone || ""}`,
      20,
      30
    );

    doc.text(
      "Professional Summary",
      20,
      50
    );

    doc.text(
      resume.summary || "",
      20,
      60
    );

    doc.text(
      "Skills",
      20,
      90
    );

    doc.text(
      resume.skills || "",
      20,
      100
    );

    doc.text(
      "Experience",
      20,
      130
    );

    doc.text(
      resume.experience || "",
      20,
      140
    );

    doc.text(
      "Education",
      20,
      170
    );

    doc.text(
      resume.education || "",
      20,
      180
    );

    doc.text(
      "Projects",
      20,
      210
    );

    doc.text(
      resume.projects || "",
      20,
      220
    );

    doc.addPage();

    doc.text(
      "Positions Of Responsibility",
      20,
      20
    );

    doc.text(
      resume.responsibilities || "",
      20,
      30
    );

    doc.text(
      "Achievements",
      20,
      60
    );

    doc.text(
      resume.achievements || "",
      20,
      70
    );

    doc.save(
      `${resume.name}_Resume.pdf`
    );
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Resume Builder</h1>

      <form onSubmit={handleSubmit}>
        <h3>Select Resume Template</h3>

        <select
          name="template"
          value={formData.template}
          onChange={handleChange}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "20px",
          }}
        >
          <option>ATS Standard</option>
          <option>Professional</option>
          <option>Modern</option>
        </select>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          onChange={handleChange}
        />

        <br />
        <br />

        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />

        <br />
        <br />

        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          onChange={handleChange}
        />

        <br />
        <br />

        <textarea
          name="skills"
          placeholder="Technical Skills"
          onChange={handleChange}
        />

        <br />
        <br />

        <textarea
          name="education"
          placeholder="Education"
          onChange={handleChange}
        />

        <br />
        <br />

        <textarea
          name="experience"
          placeholder="Experience"
          onChange={handleChange}
        />

        <br />
        <br />

        <textarea
          name="projects"
          placeholder="Projects"
          onChange={handleChange}
        />

        <br />
        <br />

        <textarea
          name="responsibilities"
          placeholder="Positions Of Responsibility"
          onChange={handleChange}
        />

        <br />
        <br />

        <textarea
          name="achievements"
          placeholder="Achievements"
          onChange={handleChange}
        />

        <br />
        <br />

        <button type="submit">
          Generate Resume
        </button>
      </form>

      {resume && (
        <>
          <button
            onClick={downloadPDF}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
            }}
          >
            Download PDF
          </button>

          <div
            style={{
              marginTop: "20px",
              border: "1px solid #ccc",
              padding: "20px",
              borderRadius: "10px",
              background: "#fff",
            }}
          >
            <h2>{resume.name}</h2>

            <p>
              {resume.email} | {resume.phone}
            </p>

            <hr />

            <h3>
              Professional Summary
            </h3>

            <p>{resume.summary}</p>

            <h3>Skills</h3>
            <p>{resume.skills}</p>

            <h3>Experience</h3>
            <p>{resume.experience}</p>

            <h3>Education</h3>
            <p>{resume.education}</p>

            <h3>Projects</h3>
            <p>{resume.projects}</p>

            <h3>
              Positions Of Responsibility
            </h3>
            <p>
              {resume.responsibilities}
            </p>

            <h3>Achievements</h3>
            <p>{resume.achievements}</p>

            <h3>
              Selected Template
            </h3>
            <p>
              {resume.template}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
