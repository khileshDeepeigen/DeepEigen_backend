import React, { useState } from "react";
import { X } from "lucide-react";
import { csrfFetch } from "../../../utils/csrfFetch";
import { API_BASE } from "../../../utils/api";

const PostModal = ({ onClose, onSubmit, sections, courseId, courseUrl, selectedSection, onPostCreated }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  
  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      setError("Please fill in both title and description");
      return;
    }
    if (!courseId || !courseUrl || !selectedSection) {
      setError("Invalid course or section");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new URLSearchParams();
      formData.append('title', title.trim());
      formData.append('question', content.trim());
      formData.append('section_id', sections.find(s => s.url === selectedSection)?.id?.toString() || '');

      const response = await csrfFetch(
        `${API_BASE}/courses/${courseId}/${courseUrl}/discussionforum/${selectedSection}/create_post/`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
          },
          body: formData.toString(),
        }
      );

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.question) {
        if (onPostCreated) {
          onPostCreated(data.question);
        }
        onSubmit({ title, content, week: "Week" });
        onClose();
      } else {
        throw new Error(data.message || 'Failed to create post');
      }
    } catch (err) {
      console.error('Failed to create post:', err);
      setError(err.message || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentSection = sections.find(s => s.url === selectedSection);
  const sectionName = currentSection?.name || "Week";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 relative">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">
            {sectionName} - Discussion
          </h2>

          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={22} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Title Input */}
        <label className="text-sm font-medium text-gray-700">
          Title for the post<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Give a post title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mt-1 mb-4 px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 focus:ring outline-none"
          disabled={loading}
        />

        {/* Description Input */}
        <label className="text-sm font-medium text-gray-700">
          Description<span className="text-red-500">*</span>
        </label>
        <textarea
          placeholder="Write more details for the post"
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full mt-1 mb-6 px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 focus:ring outline-none"
          disabled={loading}
        />

        {/* Submit Button */}
        <button 
          onClick={handleSubmit}
          disabled={loading || !title.trim() || !content.trim()}
          className={`w-full py-2.5 rounded-lg font-medium transition ${
            loading || !title.trim() || !content.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {loading ? 'Posting...' : 'Post in forum'}
        </button>
      </div>
    </div>
  );
};

export default PostModal;

