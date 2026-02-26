"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, X, Plus, Check, Maximize2, FileText, Upload, Info, Loader2, Star, AlertTriangle } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import LoadingButton from "@/components/LoadingButton";
import PageLoader from "@/components/PageLoader";
import StatusCard from "@/components/StatusCard";

const layoutOptions = [
  {
    id: "classic",
    label: "Classic Card",
    desc: "Traditional card layout with structured sections",
  },
  {
    id: "minimal",
    label: "Elegant Minimal",
    desc: "Clean, refined look with generous whitespace",
  },
  {
    id: "astrology",
    label: "Astrology Focus",
    desc: "Highlights compatibility and birth chart details",
  },
];

const MAX_PHOTOS = 10;

export default function ProfilePage() {
  const [photos, setPhotos] = useState([]);
  const [selectedLayout, setSelectedLayout] = useState("classic");
  const [enlargedPhoto, setEnlargedPhoto] = useState(null);
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [options, setOptions] = useState({
    religions: [],
    education_levels: [],
    occupation_types: [],
    salary_ranges: [],
  });

  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    birthTime: "",
    birthPlace: "",
    // Legacy text fields still stored for backward compat display
    religion: "",
    education: "",
    occupation: "",
    aboutMe: "",
    community: "",
    // Structured taxonomy FK fields
    religion_id: "",
    education_level_id: "",
    occupation_type_id: "",
    salary_range_id: "",
  });
  const [kundliDocs, setKundliDocs] = useState([]);
  const kundliInputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
    fetchPhotos();
    fetchOptions();
  }, []);

  const fetchPhotos = async () => {
    try {
      const { data } = await api.get("/photos");
      setPhotos(data.map(p => ({
        id: p.id,
        url: p.view_url,
        key: p.object_key,
        isPrimary: p.is_primary,
      })));
    } catch (error) {
      console.error("Failed to fetch photos:", error);
    }
  };

  const fetchOptions = async () => {
    try {
      const { data } = await api.get("/profile/options");
      setOptions(data);
    } catch (e) {
      console.error("Failed to fetch profile options:", e);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await api.get("/profile");
      const data = response.data;
      setFormData({
        fullName: data.full_name || "",
        dateOfBirth: data.dob || "",
        birthTime: data.birth_time || "",
        birthPlace: data.birth_place || "",
        religion: data.religion || "",
        education: data.education || "",
        occupation: data.occupation || "",
        aboutMe: data.about || "",
        community: data.community || "",
        // Populate structured FK IDs if they exist
        religion_id: data.religion_id ? String(data.religion_id) : "",
        education_level_id: data.education_level_id ? String(data.education_level_id) : "",
        occupation_type_id: data.occupation_type_id ? String(data.occupation_type_id) : "",
        salary_range_id: data.salary_range_id ? String(data.salary_range_id) : "",
      });
      setSelectedLayout(data.layout || "classic");
      setIsUnlocked(data.is_unlocked || false);
      if (typeof data.profile_completion === "number") {
        setProfileCompletion(data.profile_completion);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    const saveToast = toast.loading("Saving profile...");
    try {
      const res = await api.post("/profile", {
        full_name: formData.fullName,
        dob: formData.dateOfBirth,
        birth_time: formData.birthTime,
        birth_place: formData.birthPlace,
        about: formData.aboutMe || null,
        community: formData.community || null,
        // Send structured IDs (null if empty string)
        religion_id: formData.religion_id || null,
        education_level_id: formData.education_level_id || null,
        occupation_type_id: formData.occupation_type_id || null,
        salary_range_id: formData.salary_range_id || null,
      });
      if (typeof res.data?.profile_completion === "number") {
        setProfileCompletion(res.data.profile_completion);
      }
      toast.dismiss(saveToast);
      toast.success("Profile updated! ✨");
    } catch (error) {
      toast.dismiss(saveToast);
      console.error("Failed to save profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleLayoutChange = async (layoutId) => {
    const prevLayout = selectedLayout;
    setSelectedLayout(layoutId);
    try {
      await api.patch("/profile/layout", { layout: layoutId });
      toast.success("Layout updated! 🎨");
    } catch (error) {
      setSelectedLayout(prevLayout); // Revert on failure
      console.error("Failed to update layout:", error);
    }
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      if (photos.length >= MAX_PHOTOS) {
        toast.error("Maximum photos reached");
        break;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        continue;
      }

      const uploadToast = toast.loading(`Uploading ${file.name}...`);
      try {
        // 1. Get pre-signed URL
        const { data: { upload_url, object_key } } = await api.post("/photos/generate-upload-url", {
          file_type: file.type
        });

        // 2. Direct PUT to S3
        const res = await fetch(upload_url, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file
        });

        if (!res.ok) {
          throw new Error(`S3 upload failed with status ${res.status}`);
        }

        // 3. Confirm upload
        await api.post("/photos/confirm", {
          object_key: object_key
        });

        // 4. Refresh photos from backend (always authoritative)
        await fetchPhotos();

        toast.dismiss(uploadToast);
        toast.success(`${file.name} uploaded! 📸`);
      } catch (error) {
        toast.dismiss(uploadToast);
        console.error("Upload failed for", file.name, error);
        // Error toast is handled by Axios interceptor for API calls, 
        // but manual fetch failure needs a manual toast.
        if (error.message.includes("S3 upload failed")) {
          toast.error(`S3 upload failed for ${file.name}`);
        }
      }
    }
    e.target.value = "";
  };

  const removePhoto = async (index) => {
    const photo = photos[index];
    if (!photo.id) return;

    const deleteToast = toast.loading("Deleting photo...");
    try {
      await api.delete(`/photos/${photo.id}`);
      // Refresh from backend after deletion
      await fetchPhotos();
      toast.dismiss(deleteToast);
      toast.success("Photo deleted");
    } catch (error) {
      toast.dismiss(deleteToast);
      console.error("Failed to delete photo:", error);
    }
  };

  const handleSetPrimary = async (photo) => {
    if (photo.isPrimary) return;
    const t = toast.loading("Setting as primary...");
    try {
      await api.put(`/photos/${photo.id}/set-primary`);
      await fetchPhotos();
      toast.dismiss(t);
      toast.success("Primary photo updated! ⭐");
    } catch (error) {
      toast.dismiss(t);
      console.error("Failed to set primary photo:", error);
    }
  };

  const handleKundliUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      setKundliDocs((prev) => [
        ...prev,
        { name: file.name, type: file.type, size: file.size },
      ]);
    });
    e.target.value = "";
  };

  const removeKundliDoc = (index) => {
    setKundliDocs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="flex flex-col" style={{ gap: "32px", maxWidth: "800px" }}>
      {/* Header */}
      <section className="flex flex-col" style={{ gap: "8px" }}>
        <div className="flex items-center justify-between">
          <h1
            className="font-serif font-bold"
            style={{ fontSize: "clamp(24px, 4vw, 32px)", color: "#fce4ec" }}
          >
            My Profile
          </h1>
          <div className="flex items-center gap-2 rounded-full px-4 py-1.5" style={{ background: "rgba(79, 255, 163, 0.1)", border: "1px solid rgba(79, 255, 163, 0.2)" }}>
            <div className="h-2 w-2 rounded-full bg-[#4fffa3]" />
            <span className="font-sans text-[12px] font-semibold text-[#4fffa3]">UNLOCKED</span>
          </div>
        </div>
        <p
          className="font-sans"
          style={{ fontSize: "15px", color: "#ffb3d9", lineHeight: 1.6 }}
        >
          Add your details and photos to complete your profile.
        </p>
        <div
          className="rounded-full"
          style={{
            width: "48px",
            height: "3px",
            background: "linear-gradient(90deg, #ff4fa3, #ff85c1)",
            marginTop: "8px",
          }}
        />
      </section>

      {/* Profile Completion Card */}
      {!loading && (
        <section
          className="rounded-[20px]"
          style={{
            background: "#3a0066",
            border: "1px solid rgba(255, 133, 193, 0.1)",
            padding: "24px 32px",
          }}
        >
          <div className="flex flex-col" style={{ gap: "10px" }}>
            <div className="flex items-center justify-between">
              <span
                className="font-sans font-semibold"
                style={{ fontSize: "14px", color: "#fce4ec" }}
              >
                Profile Completion
              </span>
              <span
                className="font-sans font-bold"
                style={{ fontSize: "20px", color: profileCompletion >= 70 ? "#4fffa3" : "#ff85c1" }}
              >
                {profileCompletion}%
              </span>
            </div>
            {/* Progress bar */}
            <div
              className="w-full overflow-hidden rounded-full"
              style={{ height: "10px", background: "rgba(255, 133, 193, 0.08)", border: "1px solid rgba(255,133,193,0.1)" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${profileCompletion}%`,
                  background:
                    profileCompletion >= 70
                      ? "linear-gradient(90deg, #4fffa3, #00e5c7)"
                      : "linear-gradient(90deg, #ff4fa3, #ff85c1)",
                  transition: "width 0.6s ease",
                }}
              />
            </div>
            <p className="font-sans" style={{ fontSize: "12px", color: "#ffb3d9", opacity: 0.7 }}>
              Fill in all fields and upload a profile photo to reach 100%.
            </p>
          </div>
        </section>
      )}

      {/* Warning Banner */}
      {!loading && profileCompletion < 70 && (
        <div
          className="flex items-start gap-3 rounded-[16px]"
          style={{
            padding: "16px 20px",
            background: "rgba(255, 79, 163, 0.07)",
            border: "1px solid rgba(255, 79, 163, 0.3)",
          }}
        >
          <AlertTriangle
            className="mt-0.5 h-5 w-5 flex-shrink-0"
            style={{ color: "#ff4fa3" }}
          />
          <p className="font-sans" style={{ fontSize: "14px", color: "#fce4ec", lineHeight: 1.6 }}>
            <strong style={{ color: "#ff85c1" }}>Your profile is incomplete.</strong>{" "}Complete your profile to increase visibility and improve match quality.
          </p>
        </div>
      )}

      {loading && (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#ff4fa3]" />
        </div>
      )}

      {/* Photos Section */}
      <section
        className="rounded-[20px]"
        style={{
          background: "#3a0066",
          border: "1px solid rgba(255, 133, 193, 0.1)",
          padding: "32px",
        }}
      >
        <div className="flex flex-col" style={{ gap: "16px" }}>
          <div className="flex items-center justify-between">
            <h2
              className="font-serif font-semibold"
              style={{ fontSize: "20px", color: "#fce4ec" }}
            >
              Photos
            </h2>
            <span
              className="font-sans"
              style={{ fontSize: "13px", color: "#ffb3d9" }}
            >
              {photos.length} / {MAX_PHOTOS} photos uploaded
            </span>
          </div>

          {/* Photo grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4" style={{ gap: "12px" }}>
            {photos.map((photo, index) => (
              <div
                key={photo.id || index}
                className="group relative overflow-hidden rounded-[12px]"
                style={{
                  aspectRatio: "1",
                  background: "#2b004b",
                  border: photo.isPrimary ? "2px solid #ff85c1" : "2px solid transparent",
                }}
              >
                <img
                  src={photo.url}
                  alt={`Photo ${index + 1}`}
                  className="h-full w-full object-cover"
                  crossOrigin="anonymous"
                />
                {/* Primary badge */}
                {photo.isPrimary && (
                  <div
                    className="absolute left-2 top-2 flex items-center gap-1 rounded-full px-2 py-0.5"
                    style={{
                      background: "rgba(255, 79, 163, 0.85)",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    <Star className="h-2.5 w-2.5" style={{ color: "#fff", fill: "#fff" }} />
                    <span className="font-sans text-[10px] font-semibold text-white">Primary</span>
                  </div>
                )}
                {/* Overlay actions */}
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  style={{
                    background: "rgba(43, 0, 75, 0.6)",
                    gap: "8px",
                  }}
                >
                  {!photo.isPrimary && (
                    <button
                      onClick={() => handleSetPrimary(photo)}
                      className="flex cursor-pointer items-center justify-center rounded-full"
                      style={{
                        width: "36px",
                        height: "36px",
                        background: "rgba(255, 215, 0, 0.25)",
                        border: "none",
                      }}
                      aria-label="Set as primary photo"
                      title="Set as primary"
                    >
                      <Star className="h-4 w-4" style={{ color: "#ffd700" }} />
                    </button>
                  )}
                  <button
                    onClick={() => setEnlargedPhoto(photo.url)}
                    className="flex cursor-pointer items-center justify-center rounded-full"
                    style={{
                      width: "36px",
                      height: "36px",
                      background: "rgba(255, 133, 193, 0.2)",
                      border: "none",
                    }}
                    aria-label="Enlarge photo"
                  >
                    <Maximize2 className="h-4 w-4" style={{ color: "#fce4ec" }} />
                  </button>
                  <button
                    onClick={() => removePhoto(index)}
                    className="flex cursor-pointer items-center justify-center rounded-full"
                    style={{
                      width: "36px",
                      height: "36px",
                      background: "rgba(255, 68, 68, 0.3)",
                      border: "none",
                    }}
                    aria-label="Remove photo"
                  >
                    <X className="h-4 w-4" style={{ color: "#fce4ec" }} />
                  </button>
                </div>
              </div>
            ))}

            {/* Add photo button */}
            {photos.length < MAX_PHOTOS && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-[12px] transition-colors duration-200"
                style={{
                  aspectRatio: "1",
                  background: "rgba(255, 133, 193, 0.04)",
                  border: "2px dashed rgba(255, 133, 193, 0.15)",
                  gap: "8px",
                }}
                aria-label="Add photo"
              >
                <Plus className="h-6 w-6" style={{ color: "#ff85c1", opacity: 0.6 }} />
                <span
                  className="font-sans"
                  style={{ fontSize: "12px", color: "#ffb3d9", opacity: 0.6 }}
                >
                  Add Photo
                </span>
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handlePhotoUpload}
          />
        </div>
      </section>

      {/* Biodata Form */}
      <section
        className="rounded-[20px]"
        style={{
          background: "#3a0066",
          border: "1px solid rgba(255, 133, 193, 0.1)",
          padding: "32px",
        }}
      >
        <div className="flex flex-col" style={{ gap: "24px" }}>
          <h2
            className="font-serif font-semibold"
            style={{ fontSize: "20px", color: "#fce4ec" }}
          >
            Biodata
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: "16px" }}>
            {/* Text inputs: name, dob, time, place, community */}
            {[
              { name: "fullName", label: "Full Name", type: "text", placeholder: "Your full name" },
              { name: "dateOfBirth", label: "Date of Birth", type: "date", placeholder: "" },
              { name: "birthTime", label: "Birth Time", type: "time", placeholder: "" },
              { name: "birthPlace", label: "Birth Place", type: "text", placeholder: "City, State" },
              { name: "community", label: "Community", type: "text", placeholder: "e.g. Brahmin, Kshatriya" },
            ].map((field) => (
              <div key={field.name} className="flex flex-col" style={{ gap: "8px" }}>
                <label
                  htmlFor={field.name}
                  className="font-sans font-medium"
                  style={{ fontSize: "13px", color: "#ffb3d9" }}
                >
                  {field.label}
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="w-full font-sans outline-none transition-all duration-200"
                  style={{
                    padding: "12px 16px",
                    borderRadius: "12px",
                    fontSize: "14px",
                    color: "#fce4ec",
                    background: "rgba(255, 133, 193, 0.04)",
                    border: "1px solid rgba(255, 133, 193, 0.12)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#ff85c1";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255, 133, 193, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 133, 193, 0.12)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            ))}

            {/* DB-driven dropdowns — populated from GET /profile/options */}
            {[
              {
                id: "religion_id",
                label: "Religion",
                items: options.religions,
                getLabel: (r) => r.name,
              },
              {
                id: "education_level_id",
                label: "Education",
                items: options.education_levels,
                getLabel: (r) => r.name,
              },
              {
                id: "occupation_type_id",
                label: "Occupation",
                items: options.occupation_types,
                getLabel: (r) => r.name,
              },
              {
                id: "salary_range_id",
                label: "Annual Income",
                items: options.salary_ranges,
                getLabel: (r) => r.label,
              },
            ].map(({ id, label, items, getLabel }) => (
              <div key={id} className="flex flex-col" style={{ gap: "8px" }}>
                <label
                  htmlFor={id}
                  className="font-sans font-medium"
                  style={{ fontSize: "13px", color: "#ffb3d9" }}
                >
                  {label}
                </label>
                <select
                  id={id}
                  name={id}
                  value={formData[id]}
                  onChange={handleChange}
                  className="w-full font-sans outline-none transition-all duration-200 cursor-pointer"
                  style={{
                    padding: "12px 16px",
                    borderRadius: "12px",
                    fontSize: "14px",
                    color: formData[id] ? "#fce4ec" : "#ffb3d9",
                    background: "rgba(255, 133, 193, 0.04)",
                    border: "1px solid rgba(255, 133, 193, 0.12)",
                    appearance: "none",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ffb3d9' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 14px center",
                    paddingRight: "40px",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#ff85c1";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255, 133, 193, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 133, 193, 0.12)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <option value="" style={{ background: "#2b004b", color: "#ffb3d9" }}>
                    Select {label}
                  </option>
                  {items.map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                      style={{ background: "#2b004b", color: "#fce4ec" }}
                    >
                      {getLabel(item)}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* About Me - full width */}
          <div className="flex flex-col" style={{ gap: "8px" }}>
            <label
              htmlFor="aboutMe"
              className="font-sans font-medium"
              style={{ fontSize: "13px", color: "#ffb3d9" }}
            >
              About Me
            </label>
            <textarea
              id="aboutMe"
              name="aboutMe"
              rows={4}
              placeholder="Tell us a bit about yourself..."
              value={formData.aboutMe}
              onChange={handleChange}
              className="w-full resize-none font-sans outline-none transition-all duration-200"
              style={{
                padding: "12px 16px",
                borderRadius: "12px",
                fontSize: "14px",
                color: "#fce4ec",
                background: "rgba(255, 133, 193, 0.04)",
                border: "1px solid rgba(255, 133, 193, 0.12)",
                lineHeight: 1.6,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#ff85c1";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255, 133, 193, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 133, 193, 0.12)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          <LoadingButton
            onClick={handleSaveProfile}
            loading={saving}
            className="self-start transition-all duration-300 ease-out hover:-translate-y-[2px]"
            style={{
              padding: "14px 32px",
              borderRadius: "999px",
              fontSize: "15px",
              fontWeight: 600,
              background: "linear-gradient(90deg, #ff4fa3, #ff2d55)",
              color: "#ffffff",
              border: "none",
              boxShadow: "0 8px 24px rgba(255, 45, 85, 0.25)",
            }}
          >
            Save Profile
          </LoadingButton>
        </div>
      </section>

      {/* Profile Layout Selector */}
      <section
        className="rounded-[20px]"
        style={{
          background: "#3a0066",
          border: "1px solid rgba(255, 133, 193, 0.1)",
          padding: "32px",
        }}
      >
        <div className="flex flex-col" style={{ gap: "16px" }}>
          <div className="flex flex-col" style={{ gap: "8px" }}>
            <h2
              className="font-serif font-semibold"
              style={{ fontSize: "20px", color: "#fce4ec" }}
            >
              Profile Layout
            </h2>
            <p
              className="font-sans"
              style={{ fontSize: "14px", color: "#ffb3d9" }}
            >
              Choose how your profile appears to others.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: "12px" }}>
            {layoutOptions.map((layout) => {
              const active = selectedLayout === layout.id;
              return (
                <button
                  key={layout.id}
                  onClick={() => handleLayoutChange(layout.id)}
                  className="flex cursor-pointer flex-col items-center rounded-[16px] text-center transition-all duration-200"
                  style={{
                    padding: "24px 16px",
                    gap: "12px",
                    background: active
                      ? "rgba(255, 133, 193, 0.08)"
                      : "rgba(255, 133, 193, 0.02)",
                    border: active
                      ? "2px solid #ff85c1"
                      : "1px solid rgba(255, 133, 193, 0.08)",
                    boxShadow: active
                      ? "0 0 16px rgba(255, 133, 193, 0.12)"
                      : "none",
                  }}
                >
                  {/* Layout preview icon */}
                  <div
                    className="flex items-center justify-center rounded-[12px]"
                    style={{
                      width: "48px",
                      height: "48px",
                      background: active
                        ? "rgba(255, 133, 193, 0.12)"
                        : "rgba(255, 133, 193, 0.04)",
                    }}
                  >
                    {active ? (
                      <Check className="h-5 w-5" style={{ color: "#ff85c1" }} />
                    ) : (
                      <Camera className="h-5 w-5" style={{ color: "#ffb3d9", opacity: 0.5 }} />
                    )}
                  </div>
                  <div className="flex flex-col" style={{ gap: "4px" }}>
                    <span
                      className="font-sans font-semibold"
                      style={{
                        fontSize: "14px",
                        color: active ? "#ff85c1" : "#fce4ec",
                      }}
                    >
                      {layout.label}
                    </span>
                    <span
                      className="font-sans"
                      style={{ fontSize: "12px", color: "#ffb3d9", opacity: 0.7 }}
                    >
                      {layout.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Kundli Documents Section */}
      <section
        className="rounded-[20px]"
        style={{
          background: "#3a0066",
          border: "1px solid rgba(255, 133, 193, 0.1)",
          padding: "32px",
        }}
      >
        <div className="flex flex-col" style={{ gap: "16px" }}>
          <div className="flex flex-col" style={{ gap: "8px" }}>
            <h2
              className="font-serif font-semibold"
              style={{ fontSize: "20px", color: "#fce4ec" }}
            >
              Kundli Documents
            </h2>
            <p
              className="font-sans"
              style={{ fontSize: "14px", color: "#ffb3d9", lineHeight: 1.6 }}
            >
              Upload your Kundli chart for future compatibility matching. Accepted formats: PDF, JPG, PNG.
            </p>
          </div>

          {/* Uploaded docs list */}
          {kundliDocs.length > 0 && (
            <div className="flex flex-col" style={{ gap: "8px" }}>
              {kundliDocs.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center rounded-[12px]"
                  style={{
                    padding: "12px 16px",
                    gap: "12px",
                    background: "rgba(255, 133, 193, 0.04)",
                    border: "1px solid rgba(255, 133, 193, 0.08)",
                  }}
                >
                  <FileText
                    className="h-4 w-4 flex-shrink-0"
                    style={{ color: "#ff85c1" }}
                  />
                  <span
                    className="flex-1 truncate font-sans"
                    style={{ fontSize: "13px", color: "#fce4ec" }}
                  >
                    {doc.name}
                  </span>
                  <button
                    onClick={() => removeKundliDoc(index)}
                    className="flex flex-shrink-0 cursor-pointer items-center justify-center rounded-full"
                    style={{
                      width: "24px",
                      height: "24px",
                      background: "rgba(255, 68, 68, 0.15)",
                      border: "none",
                    }}
                    aria-label="Remove document"
                  >
                    <X className="h-3 w-3" style={{ color: "#ff6b6b" }} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload button */}
          <button
            onClick={() => kundliInputRef.current?.click()}
            className="flex cursor-pointer items-center justify-center self-start rounded-[12px] font-sans transition-colors duration-200"
            style={{
              padding: "12px 24px",
              gap: "8px",
              fontSize: "14px",
              fontWeight: 500,
              color: "#ff85c1",
              background: "rgba(255, 133, 193, 0.06)",
              border: "1px solid rgba(255, 133, 193, 0.15)",
            }}
          >
            <Upload className="h-4 w-4" />
            Upload Kundli
          </button>
          <input
            ref={kundliInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            className="hidden"
            onChange={handleKundliUpload}
          />

          {/* Note */}
          <p
            className="font-sans"
            style={{
              fontSize: "12px",
              color: "#ffb3d9",
              opacity: 0.6,
              fontStyle: "italic",
              lineHeight: 1.5,
            }}
          >
            Kundli matching will only be initiated when both users mutually agree.
          </p>
        </div>
      </section>

      {/* Kundli Compatibility Banner */}
      <section
        className="flex items-start rounded-[16px]"
        style={{
          padding: "20px 24px",
          gap: "14px",
          background: "rgba(255, 133, 193, 0.04)",
          border: "1px solid rgba(255, 133, 193, 0.1)",
        }}
      >
        <Info
          className="mt-0.5 h-5 w-5 flex-shrink-0"
          style={{ color: "#ff85c1" }}
        />
        <p
          className="font-sans"
          style={{ fontSize: "14px", color: "#fce4ec", lineHeight: 1.6 }}
        >
          Kundli compatibility will only be calculated after both parties agree to match kundlis.
          No automatic matching or background calculation takes place.
        </p>
      </section>

      {/* Enlarge Photo Modal */}
      {enlargedPhoto && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{
            background: "rgba(43, 0, 75, 0.8)",
            backdropFilter: "blur(4px)",
            padding: "24px",
          }}
          onClick={() => setEnlargedPhoto(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged photo"
        >
          <div className="relative" style={{ maxWidth: "90vw", maxHeight: "90vh" }}>
            <img
              src={enlargedPhoto}
              alt="Enlarged view"
              className="rounded-[16px] object-contain"
              style={{ maxWidth: "90vw", maxHeight: "85vh" }}
              crossOrigin="anonymous"
            />
            <button
              onClick={() => setEnlargedPhoto(null)}
              className="absolute right-3 top-3 flex cursor-pointer items-center justify-center rounded-full"
              style={{
                width: "36px",
                height: "36px",
                background: "rgba(43, 0, 75, 0.6)",
                border: "none",
              }}
              aria-label="Close enlarged view"
            >
              <X className="h-4 w-4" style={{ color: "#fce4ec" }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
