import { useRef } from "react";
import UploadForm from "./components/UploadForm";
import ImageGallery from "./components/ImageGallery";

function App() {
  const galleryRef = useRef();

  const handleUploadSuccess = () => {
    // Refresh the gallery when an image is uploaded successfully
    if (galleryRef.current) {
      galleryRef.current.fetchImages();
    }
  };

  return (
    <div className="app">
      <header>
        <h1>Image Review App</h1>
      </header>
      <main>
        <UploadForm onUploadSuccess={handleUploadSuccess} />
        <ImageGallery ref={galleryRef} />
      </main>
    </div>
  );
}

export default App;
