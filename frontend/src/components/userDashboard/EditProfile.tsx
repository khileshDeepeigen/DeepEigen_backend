import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchProfileData,
  updateProfile,
  uploadProfilePicture,
  type ProfileData,
} from "./data/typesprofile";

interface EditProfileProps {
  profileData?: ProfileData;
  onUpdateProfile?: (updatedData: Partial<ProfileData>) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export default function EditProfile({
  onUpdateProfile,
  onCancel,
}: EditProfileProps) {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
    country: "",
    state: "",
    city: "",
    address_line_1: "",
    address_line_2: "",
  });

  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch existing profile data on mount
  useEffect(() => {
    const fetchExistingProfile = async () => {
      try {
        setLoading(true);
        const response = await fetchProfileData();

        if (response.success && response.data) {
          const profile = response.data.profile;
          const address = profile.address || "";

          // Parse address string to extract parts
          const addressParts = address.split(",").map((part) => part.trim());

          setFormData({
            first_name: profile.name.split(" ")[0] || "",
            last_name: profile.name.split(" ").slice(1).join(" ") || "",
            phone_number: profile.phone || "",
            email: profile.email || "",
            country: addressParts[addressParts.length - 1] || "",
            state: addressParts[addressParts.length - 2] || "",
            city: addressParts[addressParts.length - 3] || "",
            address_line_1: addressParts[0] || "",
            address_line_2: addressParts[1] || "",
          });

          if (profile.profilePicture) {
            setProfilePicturePreview(profile.profilePicture);
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchExistingProfile();
  }, []);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle profile picture change
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle save
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Build address string from form data
      const addressParts = [
        formData.address_line_1,
        formData.address_line_2,
        formData.city,
        formData.state,
        formData.country,
      ].filter(Boolean);
      const fullAddress = addressParts.join(", ");

      // Prepare profile data for update
      const profileData: Partial<ProfileData> = {
        name: `${formData.first_name} ${formData.last_name}`.trim(),
        phone: formData.phone_number,
        address: fullAddress,
      };

      // Update profile via API
      const response = await updateProfile(profileData);

      if (response.success) {
        // Upload profile picture if changed
        if (profilePicture) {
          await uploadProfilePicture(profilePicture);
        }

        setSuccess("Profile updated successfully!");

        // Navigate back to profile after a short delay
        setTimeout(() => {
          navigate("/accounts/profile");
          window.location.reload();
        }, 1500);
      } else {
        setError(response.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("An error occurred while updating profile");
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate("/accounts/profile");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="px-4 lg:px-8 py-12 lg:py-14 max-w-6xl">
        {/* Success/Error Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 text-red-500 hover:text-red-700 float-right"
            >
              ×
            </button>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg">
            {success}
            <button
              onClick={() => setSuccess(null)}
              className="ml-2 text-green-500 hover:text-green-700 float-right"
            >
              ×
            </button>
          </div>
        )}

        {/* Profile Picture Upload */}
        <div className="flex flex-col sm:mt-0 mt-20 items-center mb-10">
          <div className="relative w-40 h-40 lg:w-48 lg:h-48 mb-4">
            <div className="w-full h-full rounded-xl bg-[rgba(0,0,0,0.04)] flex justify-center items-center overflow-hidden">
              {profilePicturePreview ? (
                <img
                  src={profilePicturePreview}
                  alt="Profile"
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                <svg
                  className="w-[68px] h-[68px] lg:w-[80px] lg:h-[80px]"
                  viewBox="0 0 68 68"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M33.9974 28.3334C40.2566 28.3334 45.3307 23.2593 45.3307 17.0001C45.3307 10.7409 40.2566 5.66675 33.9974 5.66675C27.7382 5.66675 22.6641 10.7409 22.6641 17.0001C22.6641 23.2593 27.7382 28.3334 33.9974 28.3334Z"
                    fill="#1A212F"
                    fillOpacity="0.4"
                  />
                  <path
                    d="M56.6693 49.5833C56.6693 56.6241 56.6693 62.3333 34.0026 62.3333C11.3359 62.3333 11.3359 56.6241 11.3359 49.5833C11.3359 42.5424 21.4849 36.8333 34.0026 36.8333C46.5203 36.8333 56.6693 42.5424 56.6693 49.5833Z"
                    fill="#1A212F"
                    fillOpacity="0.4"
                  />
                </svg>
              )}
            </div>

            <label
              htmlFor="profile-picture-upload"
              className="absolute bottom-0 right-0 w-12 h-12 bg-[#174CD2] rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shadow-lg"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <input
                id="profile-picture-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePictureChange}
              />
            </label>
          </div>

          <p className="text-[rgba(26,33,47,0.7)] text-sm">
            Click the camera icon to upload a new profile picture
          </p>
        </div>

        {/* Form */}
        <form className="space-y-8 max-w-3xl mx-auto" onSubmit={(e) => e.preventDefault()}>
          {/* Grid Layout for Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <div className="flex items-center gap-1 mb-2">
                <label className="block text-[#1A212F] text-sm font-medium">
                  First name
                </label>
                <span className="text-red-500">*</span>
              </div>
              <input
                type="text"
                name="first_name"
                placeholder="Enter first name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#174CD2] focus:border-transparent placeholder:text-[rgba(26,33,47,0.4)]"
              />
            </div>

            {/* Last Name */}
            <div>
              <div className="flex items-center gap-1 mb-2">
                <label className="block text-[#1A212F] text-sm font-medium">
                  Last name
                </label>
                <span className="text-red-500">*</span>
              </div>
              <input
                type="text"
                name="last_name"
                placeholder="Enter last name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#174CD2] focus:border-transparent placeholder:text-[rgba(26,33,47,0.4)]"
              />
            </div>

            {/* Phone No. */}
            <div>
              <div className="flex items-center gap-1 mb-2">
                <label className="block text-[#1A212F] text-sm font-medium">
                  Phone No.
                </label>
                <span className="text-red-500">*</span>
              </div>
              <input
                type="tel"
                name="phone_number"
                placeholder="Enter phone no."
                value={formData.phone_number}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#174CD2] focus:border-transparent placeholder:text-[rgba(26,33,47,0.4)]"
              />
            </div>

            {/* Email */}
            <div>
              <div className="flex items-center gap-1 mb-2">
                <label className="block text-[#1A212F] text-sm font-medium">
                  Email
                </label>
                <span className="text-red-500">*</span>
              </div>
              <input
                type="email"
                name="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#174CD2] focus:border-transparent placeholder:text-[rgba(26,33,47,0.4)] bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Country */}
            <div>
              <div className="flex items-center gap-1 mb-2">
                <label className="block text-[#1A212F] text-sm font-medium">
                  Country
                </label>
                <span className="text-red-500">*</span>
              </div>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#174CD2] focus:border-transparent text-[#1A212F] bg-white"
              >
                <option value="" className="text-[rgba(26,33,47,0.4)]">
                  Select your country of residence
                </option>
                <option value="UK" className="text-[#1A212F]">
                  United Kingdom
                </option>
                <option value="US" className="text-[#1A212F]">
                  United States
                </option>
                <option value="IN" className="text-[#1A212F]">
                  India
                </option>
                <option value="CA" className="text-[#1A212F]">
                  Canada
                </option>
              </select>
            </div>

            {/* State */}
            <div>
              <div className="flex items-center gap-1 mb-2">
                <label className="block text-[#1A212F] text-sm font-medium">
                  State
                </label>
                <span className="text-red-500">*</span>
              </div>
              <input
                type="text"
                name="state"
                placeholder="Enter state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#174CD2] focus:border-transparent placeholder:text-[rgba(26,33,47,0.4)]"
              />
            </div>

            {/* City */}
            <div>
              <div className="flex items-center gap-1 mb-2">
                <label className="block text-[#1A212F] text-sm font-medium">
                  City
                </label>
                <span className="text-red-500">*</span>
              </div>
              <input
                type="text"
                name="city"
                placeholder="Enter city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#174CD2] focus:border-transparent placeholder:text-[rgba(26,33,47,0.4)]"
              />
            </div>

            {/* Zip/Postal Code */}
            <div>
              <div className="flex items-center gap-1 mb-2">
                <label className="block text-[#1A212F] text-sm font-medium">
                  Postal Code
                </label>
                <span className="text-red-500">*</span>
              </div>
              <input
                type="text"
                name="postal_code"
                placeholder="Enter postal code"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#174CD2] focus:border-transparent placeholder:text-[rgba(26,33,47,0.4)]"
              />
            </div>
          </div>

          {/* Full-width fields for Address */}
          <div className="space-y-6">
            {/* Address Line - 1 */}
            <div>
              <div className="flex items-center gap-1 mb-2">
                <label className="block text-[#1A212F] text-sm font-medium">
                  Address Line - 1
                </label>
                <span className="text-red-500">*</span>
              </div>
              <input
                type="text"
                name="address_line_1"
                placeholder="Enter address line 1"
                value={formData.address_line_1}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#174CD2] focus:border-transparent placeholder:text-[rgba(26,33,47,0.4)]"
              />
            </div>

            {/* Address Line - 2 */}
            <div>
              <div className="flex items-center gap-1 mb-2">
                <label className="block text-[#1A212F] text-sm font-medium">
                  Address Line - 2
                </label>
                <span className="text-red-500">*</span>
              </div>
              <input
                type="text"
                name="address_line_2"
                placeholder="Enter address line 2"
                value={formData.address_line_2}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#174CD2] focus:border-transparent placeholder:text-[rgba(26,33,47,0.4)]"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-[rgba(0,0,0,0.08)]"></div>

          {/* Save Changes Button */}
          <div className="flex justify-center lg:justify-end pt-4 gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-10 py-3 border border-gray-300 text-[#1A212F] font-semibold text-base rounded-lg hover:bg-gray-50 transition-colors w-full lg:w-auto"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-10 py-3 bg-[#174CD2] text-white font-semibold text-base rounded-lg hover:bg-blue-700 transition-colors w-full lg:w-auto disabled:opacity-50"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

