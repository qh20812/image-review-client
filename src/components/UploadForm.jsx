import { useState } from "react";

function UploadForm({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage(""); // Clear previous messages
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please choose a photo to upload!");
      return;
    }

    setUploading(true);
    setMessage("Uploading...");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("https://image-review-server.onrender.com/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setMessage("Upload Image Success!");
        setFile(null);
        // Reset file input
        e.target.reset();
        // Notify parent component to refresh gallery
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      } else {
        setMessage("Error: " + data.error);
      }
    } catch {
      setMessage("Connect to server failed!");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-section">
      <h2>Upload Image</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange}
          disabled={uploading}
        />
        <button type="submit" disabled={uploading || !file}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
        {message && (
          <div className={`message ${message.includes("Success") ? "success" : "error"}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}

export default UploadForm;
