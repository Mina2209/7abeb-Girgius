import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useImages } from "../../contexts/ImageContext";
import { useTags } from "../../contexts/TagContext";
import { ArrowLeftIcon, XMarkIcon, PlusIcon, TrashIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import TagMultiSelect from "../../components/TagMultiSelect";
import { presign } from "../../api/uploadService";
import { API_BASE } from "../../config/apiConfig";

const ImageForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    images,
    authors,
    types,
    createImage,
    updateImage,
    addAuthor,
    removeAuthor,
    addType,
    removeType,
  } = useImages();
  const { tags, createTag } = useTags();

  const [formData, setFormData] = useState({
    title: "",
    imageUrl: "",
    authorId: "",
    typeId: "",
    ai: false,
    published: false,
    tags: [],
    pendingTagNames: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // New author/type inline creation
  const [showNewAuthor, setShowNewAuthor] = useState(false);
  const [newAuthorName, setNewAuthorName] = useState("");
  const [showNewType, setShowNewType] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");

  // Custom dropdown open state
  const [authorDropdownOpen, setAuthorDropdownOpen] = useState(false);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const authorDropdownRef = React.useRef(null);
  const typeDropdownRef = React.useRef(null);

  const isEditing = Boolean(id);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (authorDropdownRef.current && !authorDropdownRef.current.contains(e.target)) {
        setAuthorDropdownOpen(false);
      }
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target)) {
        setTypeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isEditing && images.length > 0) {
      const img = images.find((i) => i.id === id);
      if (img) {
        setFormData({
          title: img.title || "",
          imageUrl: img.imageUrl || "",
          authorId: img.authorId || "",
          typeId: img.typeId || "",
          ai: img.ai || false,
          published: img.published || false,
          tags: img.tags ? img.tags.map((t) => t.id) : [],
          pendingTagNames: [],
        });
        if (img.imageUrl) {
          setImagePreview(buildImageSrc(img.imageUrl));
        }
      }
    }
  }, [id, images, isEditing]);

  const buildImageSrc = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("/api/")) {
      return `${API_BASE.replace("/api", "")}${imageUrl}`;
    }
    return imageUrl;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadFile = async (file) => {
    setUploading(true);
    setUploadProgress(0);
    try {
      const { url, key } = await presign(file.name, file.type, "Images");
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", url);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error("Upload failed"));
        };
        xhr.onerror = () => reject(new Error("Upload error"));
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        };
        xhr.send(file);
      });
      return `/api/uploads/url?key=${encodeURIComponent(key)}`;
    } finally {
      setUploading(false);
    }
  };

  const handleAddAuthor = async () => {
    if (!newAuthorName.trim()) return;
    try {
      const author = await addAuthor(newAuthorName.trim());
      setFormData((prev) => ({ ...prev, authorId: author.id }));
      setNewAuthorName("");
      setShowNewAuthor(false);
    } catch (err) {
      console.error("Failed to create author:", err);
    }
  };

  const handleAddType = async () => {
    if (!newTypeName.trim()) return;
    try {
      const type = await addType(newTypeName.trim());
      setFormData((prev) => ({ ...prev, typeId: type.id }));
      setNewTypeName("");
      setShowNewType(false);
    } catch (err) {
      console.error("Failed to create type:", err);
    }
  };

  const handleDeleteAuthor = async (authorId) => {
    try {
      await removeAuthor(authorId);
      if (formData.authorId === authorId) {
        setFormData((prev) => ({ ...prev, authorId: "" }));
      }
    } catch (err) {
      const msg = err.message || "فشل حذف المؤلف";
      setError(msg);
    }
  };

  const handleDeleteType = async (typeId) => {
    try {
      await removeType(typeId);
      if (formData.typeId === typeId) {
        setFormData((prev) => ({ ...prev, typeId: "" }));
      }
    } catch (err) {
      const msg = err.message || "فشل حذف النوع";
      setError(msg);
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const removePendingTag = (tagNameToRemove) => {
    setFormData((prev) => ({
      ...prev,
      pendingTagNames: prev.pendingTagNames.filter(
        (name) => name !== tagNameToRemove
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let imageUrl = formData.imageUrl;

      if (imageFile) {
        imageUrl = await uploadFile(imageFile);
      }

      if (!imageUrl) {
        setError("يجب رفع صورة");
        setLoading(false);
        return;
      }

      // Auto-create author if user typed a name but didn't click إضافة
      let authorId = formData.authorId;
      if (!authorId && newAuthorName.trim()) {
        try {
          const author = await addAuthor(newAuthorName.trim());
          authorId = author.id;
        } catch (err) {
          console.error("Failed to auto-create author:", err);
        }
      }

      // Auto-create type if user typed a name but didn't click إضافة
      let typeId = formData.typeId;
      if (!typeId && newTypeName.trim()) {
        try {
          const type = await addType(newTypeName.trim());
          typeId = type.id;
        } catch (err) {
          console.error("Failed to auto-create type:", err);
        }
      }

      // Create pending tags first
      const createdTagNames = [];
      if (formData.pendingTagNames.length > 0) {
        for (const tagName of formData.pendingTagNames) {
          try {
            await createTag({ name: tagName });
            createdTagNames.push(tagName);
          } catch (err) {
            console.error(`Failed to create tag "${tagName}":`, err);
          }
        }
      }

      const allTagNames = [
        ...formData.tags
          .map((tagId) => tags.find((t) => t.id === tagId)?.name)
          .filter(Boolean),
        ...createdTagNames,
      ];

      const imageData = {
        title: formData.title,
        imageUrl,
        authorId: authorId || null,
        typeId: typeId || null,
        ai: formData.ai,
        published: formData.published,
        tags: allTagNames,
      };

      if (isEditing) {
        await updateImage(id, imageData);
      } else {
        await createImage(imageData);
      }

      navigate("/image-library");
    } catch (err) {
      setError(err.message || "حدث خطأ أثناء حفظ الصورة");
    } finally {
      setLoading(false);
    }
  };

  const selectedAuthorName = formData.authorId
    ? authors.find((a) => a.id === formData.authorId)?.name || "بدون مؤلف"
    : "بدون مؤلف";

  const selectedTypeName = formData.typeId
    ? types.find((t) => t.id === formData.typeId)?.name || "بدون نوع"
    : "بدون نوع";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate("/image-library")}
          className="flex items-center text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 mb-4 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 ml-2" />
          العودة إلى مكتبة الصور
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isEditing ? "تعديل الصورة" : "إضافة صورة جديدة"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            العنوان *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="block w-full px-3 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            placeholder="أدخل عنوان الصورة"
            dir="rtl"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            الصورة *
          </label>
          <div className="space-y-3">
            {imagePreview && (
              <div className="relative w-48 h-48 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-slate-600 shadow-md">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                    if (!isEditing) {
                      setFormData((prev) => ({ ...prev, imageUrl: "" }));
                    }
                  }}
                  className="absolute top-1 right-1 bg-red-500/90 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-emerald-50 dark:file:bg-emerald-900/30 file:text-emerald-700 dark:file:text-emerald-300 hover:file:bg-emerald-100 dark:hover:file:bg-emerald-900/50 transition-all"
            />
            {uploading && (
              <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Author - Custom Dropdown */}
        <div className="relative" ref={authorDropdownRef}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            المؤلف
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setAuthorDropdownOpen(!authorDropdownOpen); setTypeDropdownOpen(false); }}
              className="flex-1 flex items-center justify-between px-3 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-right"
            >
              <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform ${authorDropdownOpen ? "rotate-180" : ""}`} />
              <span>{selectedAuthorName}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowNewAuthor(!showNewAuthor)}
              className="px-3 py-2.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-xl border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
              title="إضافة مؤلف جديد"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
          {authorDropdownOpen && (
            <div className="absolute z-20 mt-1 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              <div
                onClick={() => { setFormData((prev) => ({ ...prev, authorId: "" })); setAuthorDropdownOpen(false); }}
                className={`flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 text-right transition-colors ${!formData.authorId ? "bg-emerald-50 dark:bg-emerald-900/20" : ""}`}
              >
                <span />
                <span className="text-gray-700 dark:text-gray-300">بدون مؤلف</span>
              </div>
              {authors.map((a) => {
                const count = a._count?.images || 0;
                const isSelected = formData.authorId === a.id;
                return (
                  <div
                    key={a.id}
                    className={`flex items-center justify-between px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors ${isSelected ? "bg-emerald-50 dark:bg-emerald-900/20" : ""}`}
                  >
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDeleteAuthor(a.id); }}
                      disabled={count > 0}
                      className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title={count > 0 ? `مرتبط بـ ${count} صورة` : "حذف"}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                    <span
                      onClick={() => { setFormData((prev) => ({ ...prev, authorId: a.id })); setAuthorDropdownOpen(false); }}
                      className="flex-1 text-right cursor-pointer text-gray-700 dark:text-gray-300"
                    >
                      {a.name}
                      {count > 0 && <span className="text-xs text-gray-400 mr-1">({count})</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          {showNewAuthor && (
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newAuthorName}
                onChange={(e) => setNewAuthorName(e.target.value)}
                placeholder="اسم المؤلف الجديد"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                dir="rtl"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddAuthor();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddAuthor}
                className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm hover:bg-emerald-600 transition-colors"
              >
                إضافة
              </button>
            </div>
          )}
        </div>

        {/* Type - Custom Dropdown */}
        <div className="relative" ref={typeDropdownRef}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            النوع
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setTypeDropdownOpen(!typeDropdownOpen); setAuthorDropdownOpen(false); }}
              className="flex-1 flex items-center justify-between px-3 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-right"
            >
              <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform ${typeDropdownOpen ? "rotate-180" : ""}`} />
              <span>{selectedTypeName}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowNewType(!showNewType)}
              className="px-3 py-2.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-xl border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
              title="إضافة نوع جديد"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
          {typeDropdownOpen && (
            <div className="absolute z-20 mt-1 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              <div
                onClick={() => { setFormData((prev) => ({ ...prev, typeId: "" })); setTypeDropdownOpen(false); }}
                className={`flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 text-right transition-colors ${!formData.typeId ? "bg-emerald-50 dark:bg-emerald-900/20" : ""}`}
              >
                <span />
                <span className="text-gray-700 dark:text-gray-300">بدون نوع</span>
              </div>
              {types.map((t) => {
                const count = t._count?.images || 0;
                const isSelected = formData.typeId === t.id;
                return (
                  <div
                    key={t.id}
                    className={`flex items-center justify-between px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors ${isSelected ? "bg-emerald-50 dark:bg-emerald-900/20" : ""}`}
                  >
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDeleteType(t.id); }}
                      disabled={count > 0}
                      className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title={count > 0 ? `مرتبط بـ ${count} صورة` : "حذف"}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                    <span
                      onClick={() => { setFormData((prev) => ({ ...prev, typeId: t.id })); setTypeDropdownOpen(false); }}
                      className="flex-1 text-right cursor-pointer text-gray-700 dark:text-gray-300"
                    >
                      {t.name}
                      {count > 0 && <span className="text-xs text-gray-400 mr-1">({count})</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          {showNewType && (
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                placeholder="اسم النوع الجديد"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                dir="rtl"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddType();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddType}
                className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm hover:bg-emerald-600 transition-colors"
              >
                إضافة
              </button>
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            المواضيع
          </label>
          <TagMultiSelect
            allTags={tags}
            selectedIds={formData.tags}
            onChange={(next) =>
              setFormData((prev) => ({ ...prev, tags: next }))
            }
            placeholder="اختيار المواضيع"
            pendingTagNames={formData.pendingTagNames}
            onAddPendingTag={(tagName) => {
              setFormData((prev) => ({
                ...prev,
                pendingTagNames: [...prev.pendingTagNames, tagName],
              }));
            }}
          />

          {/* Selected Tags */}
          {(formData.tags.length > 0 || formData.pendingTagNames.length > 0) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.tags.map((tagId) => {
                const t = tags.find((x) => x.id === tagId);
                return (
                  <span
                    key={tagId}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300"
                  >
                    {t?.name || tagId}
                    <button
                      type="button"
                      onClick={() => removeTag(tagId)}
                      className="mr-2 text-blue-600 dark:text-blue-400 hover:text-blue-800"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </span>
                );
              })}
              {formData.pendingTagNames.map((tagName) => (
                <span
                  key={`pending-${tagName}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700"
                >
                  {tagName} (جديد)
                  <button
                    type="button"
                    onClick={() => removePendingTag(tagName)}
                    className="mr-2 text-yellow-600 dark:text-yellow-400 hover:text-yellow-800"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Toggles: AI and Published */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-slate-600">
            <input
              type="checkbox"
              id="ai"
              name="ai"
              checked={formData.ai}
              onChange={handleInputChange}
              className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-slate-500 rounded"
            />
            <label htmlFor="ai" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              مُنشأ بالذكاء الاصطناعي (AI)
            </label>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-slate-600">
            <input
              type="checkbox"
              id="published"
              name="published"
              checked={formData.published}
              onChange={handleInputChange}
              className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 dark:border-slate-500 rounded"
            />
            <label htmlFor="published" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              منشور (متاح للمستخدمين)
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3 space-x-reverse">
          <button
            type="button"
            onClick={() => navigate("/image-library")}
            className="px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-slate-600 rounded-xl hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={loading || uploading}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
          >
            {loading ? "جاري الحفظ..." : isEditing ? "تحديث" : "حفظ"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ImageForm;
