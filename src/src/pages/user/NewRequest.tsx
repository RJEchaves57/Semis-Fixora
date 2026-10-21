import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ImagePlus,
  Send,
  Trash2,
  Video as VideoIcon,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useRequests } from "../../context/RequestsContext";
import { categories } from "../../data/constants";
import type { Priority } from "../../../types";

// Media rules (change here if your instructor wants different limits)
const MIN_IMAGES = 1;
const MAX_IMAGES = 6;
const MAX_IMAGE_MB = 5;
const MAX_VIDEO_MB = 50;

type Picked = { file: File; url: string };

export default function NewRequest() {
  const { user } = useAuth();
  const { addRequest } = useRequests();
  const navigate = useNavigate();
  const imgInput = useRef<HTMLInputElement>(null);
  const vidInput = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    category: categories[0],
    priority: "Medium" as Priority,
    location: "",
    description: "",
  });
  const [images, setImages] = useState<Picked[]>([]);
  const [video, setVideo] = useState<Picked | null>(null);
  const [mediaErrors, setMediaErrors] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onImages = (e: ChangeEvent<HTMLInputElement>) => {
    const errs: string[] = [];
    const accepted: Picked[] = [];
    for (const file of Array.from(e.target.files ?? [])) {
      if (!file.type.startsWith("image/"))
        errs.push(`“${file.name}” is not an image.`);
      else if (file.size > MAX_IMAGE_MB * 1024 * 1024)
        errs.push(`“${file.name}” is larger than ${MAX_IMAGE_MB} MB.`);
      else if (images.length + accepted.length >= MAX_IMAGES) {
        errs.push(`You can upload up to ${MAX_IMAGES} photos.`);
        break;
      } else accepted.push({ file, url: URL.createObjectURL(file) });
    }
    setImages((old) => [...old, ...accepted]);
    setMediaErrors(errs);
    e.target.value = "";
  };

  const onVideo = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("video/"))
      return setMediaErrors([`“${file.name}” is not a video.`]);
    if (file.size > MAX_VIDEO_MB * 1024 * 1024)
      return setMediaErrors([`The video is larger than ${MAX_VIDEO_MB} MB.`]);
    if (video) URL.revokeObjectURL(video.url);
    setVideo({ file, url: URL.createObjectURL(file) });
    setMediaErrors([]);
  };

  const removeImage = (url: string) => {
    URL.revokeObjectURL(url);
    setImages((old) => old.filter((i) => i.url !== url));
  };
  const removeVideo = () => {
    if (video) URL.revokeObjectURL(video.url);
    setVideo(null);
  };

  const errors = {
    title: !form.title.trim() ? "Please enter a short title." : "",
    location: !form.location.trim() ? "Please enter the location." : "",
    description: !form.description.trim() ? "Please describe the problem." : "",
    images:
      images.length < MIN_IMAGES
        ? `Add at least ${MIN_IMAGES} photo${MIN_IMAGES > 1 ? "s" : ""} of the problem.`
        : "",
    video: !video ? "A video of the problem is required." : "",
  };
  const invalid = Object.values(errors).some(Boolean);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (invalid || !video) return;
    addRequest({
      ...form,
      title: form.title.trim(),
      location: form.location.trim(),
      description: form.description.trim(),
      images: images.map((i) => ({ name: i.file.name, url: i.url })),
      video: { name: video.file.name, url: video.url },
      requesterId: user!.id,
      requester: user!.name,
    });
    navigate("/user/requests");
  };

  const err = (msg: string) =>
    submitted && msg ? <small className="f-err">{msg}</small> : null;

  return (
    <>
      <button className="u-back" onClick={() => navigate(-1)}>
        <ArrowLeft size={15} /> Back
      </button>
      <div className="u-page-head">
        <div>
          <h1>New maintenance request</h1>
          <p>Tell us what’s wrong and show us with photos and a video.</p>
        </div>
      </div>

      <form className="u-form" onSubmit={submit} noValidate>
        <section className="u-card f-grid">
          <h2>Issue details</h2>
          <label className="f-full">
            Title
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Broken classroom light"
            />
            {err(errors.title)}
          </label>
          <label>
            Category
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Priority
            <select
              value={form.priority}
              onChange={(e) => set("priority", e.target.value as Priority)}
            >
              {(["Low", "Medium", "High"] as Priority[]).map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          <label className="f-full">
            Location
            <input
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="Building, floor, room…"
            />
            {err(errors.location)}
          </label>
          <label className="f-full">
            Description
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="What happened? When did you notice it?"
            />
            {err(errors.description)}
          </label>
        </section>

        <section className="u-card">
          <h2>
            Photos <em>required</em>
          </h2>
          <p className="f-help">
            Upload {MIN_IMAGES > 1 ? `at least ${MIN_IMAGES}` : "one or more"}{" "}
            photos (max {MAX_IMAGES}, {MAX_IMAGE_MB} MB each).
          </p>
          <input
            ref={imgInput}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={onImages}
          />
          <div className="m-grid">
            {images.map((i) => (
              <div className="m-tile" key={i.url}>
                <img src={i.url} alt={i.file.name} />
                <button
                  type="button"
                  aria-label={`Remove ${i.file.name}`}
                  onClick={() => removeImage(i.url)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <button
                type="button"
                className="m-add"
                onClick={() => imgInput.current?.click()}
              >
                <ImagePlus size={22} />
                <span>Add photos</span>
              </button>
            )}
          </div>
          {err(errors.images)}
        </section>

        <section className="u-card">
          <h2>
            Video <em>required</em>
          </h2>
          <p className="f-help">
            Upload one short video showing the problem (max {MAX_VIDEO_MB} MB).
          </p>
          <input
            ref={vidInput}
            type="file"
            accept="video/*"
            hidden
            onChange={onVideo}
          />
          {video ? (
            <div className="m-video">
              <video src={video.url} controls preload="metadata" />
              <div>
                <span>{video.file.name}</span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={removeVideo}
                >
                  <Trash2 size={13} /> Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="m-add m-add-wide"
              onClick={() => vidInput.current?.click()}
            >
              <VideoIcon size={22} />
              <span>Choose a video</span>
            </button>
          )}
          {err(errors.video)}
        </section>

        {mediaErrors.length > 0 && (
          <div className="f-alert" role="alert">
            {mediaErrors.map((m) => (
              <div key={m}>{m}</div>
            ))}
          </div>
        )}
        {submitted && invalid && (
          <div className="f-alert" role="alert">
            Please complete the required fields above — photos and a video are
            both required.
          </div>
        )}

        <div className="f-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            <Send size={15} /> Submit request
          </button>
        </div>
      </form>
    </>
  );
}
