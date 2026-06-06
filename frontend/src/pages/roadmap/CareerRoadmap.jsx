import { useState } from "react";
import axios from "axios";

export default function CareerRoadmap() {
  const [role, setRole] = useState("");
  const [roadmap, setRoadmap] = useState([]);
  const [loading, setLoading] =
    useState(false);

  const generateRoadmap = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/roadmap/generate",
        {
          role,
        }
      );

      setRoadmap(
        res.data.roadmap
      );
    } catch (error) {
      console.log(error);
      alert(
        "Failed to generate roadmap"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "30px",
      }}
    >
      <h1>
        Career Roadmap Generator
      </h1>

      <input
        type="text"
        placeholder="Enter Career Role"
        value={role}
        onChange={(e) =>
          setRole(e.target.value)
        }
        style={{
          padding: "10px",
          width: "300px",
          marginRight: "10px",
        }}
      />

      <button
        onClick={
          generateRoadmap
        }
      >
        Generate Roadmap
      </button>

      {loading && (
        <p>
          Generating roadmap...
        </p>
      )}

      {roadmap.length > 0 && (
        <div
          style={{
            marginTop: "30px",
          }}
        >
          <h2>
            Your Learning Path
          </h2>

          {roadmap.map(
            (
              item,
              index
            ) => (
              <div
                key={index}
                style={{
                  border:
                    "1px solid #ddd",
                  padding:
                    "15px",
                  marginBottom:
                    "10px",
                  borderRadius:
                    "8px",
                }}
              >
                <h3>
                  Month{" "}
                  {index + 1}
                </h3>

                <p>
                  {item}
                </p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}