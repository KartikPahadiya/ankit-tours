import { useEffect, useState } from "react";
import {
  AdminStayImage,
  deleteAdminStayImage,
  getAdminStayImages,
  uploadAdminStayImage,
} from "../../services/adminService";

interface Props {
  stayId: number;
}

export default function StayImageManager({
  stayId,
}: Props) {
  const [images, setImages] = useState<AdminStayImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function loadImages() {
    try {
      const data = await getAdminStayImages(stayId);
      setImages(data);
    } catch {
      setError("Failed to load images.");
    }
  }

  useEffect(() => {
    loadImages();
  }, [stayId]);

  const handleUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setUploading(true);
      setError("");

      const image = await uploadAdminStayImage(
        stayId,
        file
      );

      setImages((current) => [
        ...current,
        image,
      ]);
    } catch {
      setError(
        "Failed to upload image. Only JPG, PNG or WebP up to 5 MB are allowed."
      );
    } finally {
      setUploading(false);

      event.target.value = "";
    }
  };

  const handleDelete = async (
    imageId: number
  ) => {
    const confirmed = window.confirm(
      "Delete this image?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteAdminStayImage(
        stayId,
        imageId
      );

      setImages((current) =>
        current.filter(
          (image) => image.id !== imageId
        )
      );
    } catch {
      setError("Failed to delete image.");
    }
  };

  return (
    <div className="mt-8">

      <div className="mb-4">

        <h3 className="text-xl font-semibold">
          Property Photos
        </h3>

        <p className="text-sm text-gray-500">
          Upload real photos of this property — the first one becomes
          the main image customers see on the website.
        </p>

      </div>

      {/* Upload */}
      <label className="inline-flex cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800">
        {uploading
          ? "Uploading..."
          : "+ Upload Photo"}

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          disabled={uploading}
          onChange={handleUpload}
        />
      </label>

      {error && (
        <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {images.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed py-12 text-center text-gray-500">
          No photos yet. Upload the property's photos above — they will
          appear on the website.
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">

          {images.map((image) => (
            <div
              key={image.id}
              className="group relative overflow-hidden rounded-xl border bg-gray-100"
            >

              <img
                src={image.image_url}
                alt="Property"
                className="h-40 w-full object-cover"
              />

              {image.is_primary && (
                <span className="absolute left-2 top-2 rounded bg-white px-2 py-1 text-xs font-medium">
                  Main image
                </span>
              )}

              <button
                onClick={() =>
                  handleDelete(image.id)
                }
                className="absolute right-2 top-2 rounded bg-red-600 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100"
              >
                Delete
              </button>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}
