import { useState, useEffect, forwardRef, useImperativeHandle } from "react";

const ImageGallery = forwardRef((props, ref) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch("https://image-review-server.onrender.com/api/images");
      if (response.ok) {
        const data = await response.json();
        setImages(data);
      } else {
        setError("Failed to fetch images");
      }
    } catch {
      setError("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  // Expose fetchImages method to parent component
  useImperativeHandle(ref, () => ({
    fetchImages
  }));

  const handleLike = async (imageId) => {
    try {
      const response = await fetch(
        `https://image-review-server.onrender.com/api/images/${imageId}/like`,
        {
          method: "POST",
        }
      );
      if (response.ok) {
        // Refresh images to get updated likes
        fetchImages();
      }
    } catch {
      console.error("Error liking image");
    }
  };

  const handleComment = async (imageId, comment) => {
    if (!comment.trim()) return;

    try {
      const response = await fetch(
        `https://image-review-server.onrender.com/api/images/${imageId}/comment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: comment }),
        }
      );
      if (response.ok) {
        // Refresh images to get updated comments
        fetchImages();
      }
    } catch {
      console.error("Error adding comment");
    }
  };

  if (loading) return <div>Loading images...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="image-gallery">
      <h2>Image Gallery</h2>
      {images.length === 0 ? (
        <p>No images uploaded yet.</p>
      ) : (
        <div className="images-grid">
          {images.map((image) => (
            <ImageCard
              key={image._id}
              image={image}
              onLike={() => handleLike(image._id)}
              onComment={(comment) => handleComment(image._id, comment)}
            />
          ))}
        </div>
      )}
    </div>
  );
});

function ImageCard({ image, onLike, onComment }) {
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);

  const handleSubmitComment = (e) => {
    e.preventDefault();
    onComment(commentText);
    setCommentText("");
  };

  return (
    <div className="image-card">
      <img src={image.secure_url} alt={image.originalname} />
      <div className="image-info">
        <h3>{image.originalname}</h3>
        <p>Format: {image.format}</p>
        <p>Size: {Math.round(image.bytes / 1024)} KB</p>
        <p>Dimensions: {image.width} x {image.height}</p>
        <p>Uploaded: {new Date(image.uploadDate).toLocaleDateString()}</p>
        
        <div className="actions">
          <button onClick={onLike}>
            👍 Like ({image.likes})
          </button>
          <button onClick={() => setShowComments(!showComments)}>
            💬 Comments ({image.comments.length})
          </button>
        </div>

        {showComments && (
          <div className="comments-section">
            <form onSubmit={handleSubmitComment}>
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
              />
              <button type="submit">Post</button>
            </form>
            <div className="comments">
              {image.comments.map((comment, index) => (
                <div key={index} className="comment">
                  <p>{comment.text}</p>
                  <small>{new Date(comment.createdAt).toLocaleString()}</small>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageGallery;
