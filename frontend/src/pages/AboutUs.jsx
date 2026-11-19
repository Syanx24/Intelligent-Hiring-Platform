import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, ImagePlus, LoaderCircle, LockKeyhole, Trash2, Upload, X } from "lucide-react";
import { FaLinkedin, FaInstagram, FaFacebookSquare } from "react-icons/fa";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import teamMembers from "../Data/teamMembers.json";
import { clearStoredAuth, getStoredUser } from "../service/apiClient.js";
import { getCurrentUser } from "../service/authAPI.js";
import { deleteAboutImage, getAboutImages, uploadAboutImage, verifyAboutImagesAdmin } from "../service/aboutImagesAPI.js";

const MAX_IMAGE_SIZE = 3 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read this image file."));
    reader.readAsDataURL(file);
  });
}

export default function AboutUsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getStoredUser());
  const [aboutImages, setAboutImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(true);
  const [imagesError, setImagesError] = useState("");
  const [imageNotice, setImageNotice] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [imageManagerOpen, setImageManagerOpen] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);

  useEffect(() => {
    getCurrentUser().then(setUser);
    let active = true;
    getAboutImages()
      .then((images) => {
        if (active) setAboutImages(Array.isArray(images) ? images : []);
      })
      .catch((error) => {
        if (active) setImagesError(error.message || "Could not load About Us images.");
      })
      .finally(() => {
        if (active) setImagesLoading(false);
      });
    return () => { active = false; };
  }, []);

  const profileImages = useMemo(
    () => new Map(aboutImages.filter((image) => image.kind === "profile").map((image) => [String(image.memberId), image])),
    [aboutImages],
  );
  const profileBackgrounds = useMemo(
    () => new Map(aboutImages.filter((image) => image.kind === "profile-background").map((image) => [String(image.memberId), image])),
    [aboutImages],
  );
  const backgroundImages = useMemo(
    () => aboutImages.filter((image) => image.kind === "background"),
    [aboutImages],
  );

  const signOut = () => {
    clearStoredAuth();
    setUser(null);
    navigate("/", { replace: true });
  };

  const beginUpload = async (kind, file, memberId = "") => {
    if (imageBusy) return;
    setImagesError("");
    setImageNotice("");
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setImagesError("Choose a JPEG, PNG, WEBP, or GIF image.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setImagesError("Images must be smaller than 3MB.");
      return;
    }
    if (!imageManagerOpen || !adminPassword) {
      setImagesError("Unlock image management before uploading.");
      return;
    }

    setImageBusy(true);
    try {
      const fileData = await readAsDataUrl(file);
      const uploaded = await uploadAboutImage({
        kind,
        memberId: String(memberId),
        fileName: file.name,
        fileData,
        password: adminPassword,
      });
      setAboutImages((current) => [
        uploaded,
        ...current.filter((image) => !(image.kind === uploaded.kind && image.key === uploaded.key)),
      ]);
      setImageNotice("Image uploaded to Cloudinary.");
    } catch (error) {
      setImagesError(error.message || "Could not upload About Us image.");
    } finally {
      setImageBusy(false);
    }
  };

  const beginDelete = (image) => {
    setImagesError("");
    setImageNotice("");
    setPendingAction({ type: "delete", image });
  };

  const closeAdminDialog = () => {
    if (imageBusy) return;
    setPendingAction(null);
    if (!imageManagerOpen) setAdminPassword("");
  };

  const toggleImageManager = () => {
    setImagesError("");
    setImageNotice("");
    if (imageManagerOpen) {
      setImageManagerOpen(false);
      setAdminPassword("");
      setPendingAction(null);
      return;
    }
    setAdminPassword("");
    setPendingAction({ type: "verify" });
  };

  const submitAdminAction = async (event) => {
    event.preventDefault();
    if (!pendingAction || (pendingAction.type === "verify" && !adminPassword)) return;
    setImagesError("");
    setImageBusy(true);
    try {
      if (pendingAction.type === "verify") {
        await verifyAboutImagesAdmin(adminPassword);
        setImageManagerOpen(true);
        setImageNotice("Image manager unlocked for this page session.");
      } else {
        await deleteAboutImage({ imageId: pendingAction.image._id, password: adminPassword });
        setAboutImages((current) => current.filter((image) => image._id !== pendingAction.image._id));
        setImageNotice("Image deleted from Cloudinary.");
      }
      setPendingAction(null);
    } catch (error) {
      setImagesError(error.message || "Image operation failed.");
    } finally {
      setImageBusy(false);
    }
  };

  return (
    <div className="site-shell min-h-screen w-full overflow-x-hidden bg-[#f7f8f4] text-[#20221e]">
      <Header
        page="info"
        user={user}
        onProfileClick={() => navigate(user?.role === "company" ? "/recruiter" : "/candidate")}
        onLogout={signOut}
      />
      <main className="section-wrap mx-auto min-h-[65vh] w-[90%] max-w-[1160px] py-12 sm:py-16">
        <section className="relative mb-8 flex min-h-64 items-end overflow-hidden rounded-3xl bg-gradient-to-br from-[#17264b] via-[#315fce] to-[#5188d9] p-7 text-white shadow-lg sm:p-10">
          {backgroundImages[0] && (
            <img src={backgroundImages[0].secureUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/50 to-slate-900/20" />
          <div className="relative z-10 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-100">HireMe NexTech99</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">About Us</h1>
            <p className="mt-3 text-sm leading-relaxed text-white/85">
              Meet the people building a better way for engineers and teams to find the right fit.
            </p>
          </div>
        </section>

        {imageManagerOpen && imagesError && (
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            <span>{imagesError}</span>
          </div>
        )}
        {imageManagerOpen && imageNotice && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800" role="status">
            <CheckCircle2 size={17} className="shrink-0" />
            <span>{imageNotice}</span>
          </div>
        )}

        {imageManagerOpen && <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">About page backgrounds</h2>
              <p className="mt-1 text-xs text-slate-500">The newest image is used as the page banner background.</p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-slate-700">
              <ImagePlus size={15} /> Add background image
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={(event) => {
                  beginUpload("background", event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
            </label>
          </div>
          {imagesLoading ? (
            <p className="flex items-center gap-2 py-5 text-xs text-slate-500"><LoaderCircle size={15} className="animate-spin" /> Loading images…</p>
          ) : backgroundImages.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {backgroundImages.map((image) => (
                <div key={image._id} className="group relative aspect-[16/9] overflow-hidden rounded-xl bg-slate-100">
                  <img src={image.secureUrl} alt="About page background" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                  <span className="absolute bottom-2 left-2 rounded-md bg-slate-950/65 px-2 py-1 text-[10px] font-medium text-white">
                    {image.fileName || "Background image"}
                  </span>
                  <button
                    type="button"
                    onClick={() => beginDelete(image)}
                    title="Delete this background image"
                    aria-label="Delete this background image"
                    className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-lg bg-rose-600/95 px-2.5 py-2 text-xs font-semibold text-white opacity-0 shadow transition hover:bg-rose-700 focus-visible:opacity-100 group-hover:opacity-100"
                    disabled={imageBusy}
                  >
                    <Trash2 size={14} /><span>Delete</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-xs text-slate-500">No background images uploaded yet.</p>
          )}
        </section>}

        <div className="mb-5">
          <h2 className="text-2xl font-bold text-slate-900">Meet the team</h2>
          <p className="mt-1 text-sm text-slate-500">Names, roles, and social links are maintained in teamMembers.json.</p>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member) => {
            const profileImage = profileImages.get(String(member.id));
            const profileBackground = profileBackgrounds.get(String(member.id));
            const inputId = `profile-image-${member.id}`;
            const backgroundInputId = `profile-background-${member.id}`;
            return (
              <div
                key={member.id}
                className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl bg-white text-center shadow-lg transition-transform duration-300 hover:-translate-y-1"
              >
                <div
                  className="group relative bg-gray-100 bg-cover bg-center p-6"
                  style={profileBackground ? { backgroundImage: `linear-gradient(#11182744, #11182744), url("${profileBackground.secureUrl}")` } : undefined}
                >
                  <img
                    src={profileImage?.secureUrl || member.image}
                    alt={member.name}
                    className="mx-auto h-36 w-36 rounded-full border-4 border-white object-cover shadow-md"
                  />
                  {imageManagerOpen && profileImage && (
                    <button
                      type="button"
                      onClick={() => beginDelete(profileImage)}
                      title={`Delete ${member.name}'s profile image`}
                      aria-label={`Delete ${member.name}'s profile image`}
                      className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-lg bg-rose-600/95 px-2.5 py-2 text-xs font-semibold text-white opacity-0 shadow transition hover:bg-rose-700 focus-visible:opacity-100 group-hover:opacity-100"
                      disabled={imageBusy}
                    >
                      <Trash2 size={14} /><span>Delete</span>
                    </button>
                  )}
                  {imageManagerOpen && profileBackground && (
                    <button
                      type="button"
                      onClick={() => beginDelete(profileBackground)}
                      title={`Delete ${member.name}'s profile background`}
                      aria-label={`Delete ${member.name}'s profile background`}
                      className="absolute bottom-4 right-4 inline-flex items-center gap-1 rounded-lg bg-rose-600/95 px-2.5 py-2 text-xs font-semibold text-white opacity-0 shadow transition hover:bg-rose-700 focus-visible:opacity-100 group-hover:opacity-100"
                      disabled={imageBusy}
                    >
                      <Trash2 size={14} /><span>Delete background</span>
                    </button>
                  )}
                </div>

                {imageManagerOpen && (
                  <div className="bg-slate-50 px-4 py-2 text-center">
                    <label htmlFor={backgroundInputId} className={`inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 ${imageBusy ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
                      <ImagePlus size={14} /> {profileBackground ? "Replace profile background" : "Add profile background"}
                    </label>
                    <input
                      id={backgroundInputId}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="sr-only"
                      onChange={(event) => {
                        beginUpload("profile-background", event.target.files?.[0], String(member.id));
                        event.target.value = "";
                      }}
                    />
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-800">{member.name}</h3>
                  <p className="mt-2 text-sm font-medium text-gray-500">Role: {member.role}</p>

                  <div className="mt-5 flex justify-center gap-5">
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${member.name}'s LinkedIn`} className="text-blue-700 transition-colors hover:text-blue-900"><FaLinkedin size={24} /></a>
                    <a href={member.instagram} target="_blank" rel="noopener noreferrer" aria-label={`${member.name}'s Instagram`} className="text-pink-600 transition-colors hover:text-pink-800"><FaInstagram size={24} /></a>
                    <a href={member.facebook} target="_blank" rel="noopener noreferrer" aria-label={`${member.name}'s Facebook`} className="text-blue-600 transition-colors hover:text-blue-800"><FaFacebookSquare size={24} /></a>
                  </div>

                  {imageManagerOpen && (
                    <label htmlFor={inputId} className={`mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 ${imageBusy ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
                      <Upload size={14} /> {profileImage ? "Replace profile image" : "Add profile image"}
                    </label>
                  )}
                  <input
                    id={inputId}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    onChange={(event) => {
                      beginUpload("profile", event.target.files?.[0], String(member.id));
                      event.target.value = "";
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={toggleImageManager}
            disabled={imageBusy}
            title={imageManagerOpen ? "Close image manager" : "Manage About Us images"}
            aria-label={imageManagerOpen ? "Close About Us image manager" : "Unlock About Us image manager"}
            aria-pressed={imageManagerOpen}
            className={`grid h-8 w-8 place-items-center rounded-full blur-[0.5px] transition-all hover:blur-0 focus-visible:blur-0 disabled:opacity-30 ${imageManagerOpen ? "text-emerald-700 opacity-50 hover:opacity-90 focus-visible:opacity-100" : "text-slate-500 opacity-45 hover:opacity-90 focus-visible:opacity-100"}`}
          >
            <LockKeyhole size={15} />
          </button>
        </div>
      </main>
      <Footer />

      {pendingAction && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/55 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeAdminDialog(); }}>
          {pendingAction.type === "verify" ? (
            <section className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl" role="dialog" aria-modal="true" aria-label="Verify admin password">
              <form onSubmit={submitAdminAction} className="flex items-center gap-2">
                <input
                  id="about-admin-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  autoFocus
                  aria-label="Admin password"
                  placeholder="Admin password"
                  value={adminPassword}
                  onChange={(event) => setAdminPassword(event.target.value)}
                  className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <button type="button" onClick={closeAdminDialog} disabled={imageBusy} aria-label="Cancel" title="Cancel" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50">
                  <X size={18} />
                </button>
                <button type="submit" disabled={imageBusy || !adminPassword} aria-label="Unlock image manager" title="Unlock image manager" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-900 text-white hover:bg-slate-700 disabled:opacity-50">
                  {imageBusy ? <LoaderCircle size={17} className="animate-spin" /> : <LockKeyhole size={17} />}
                </button>
              </form>
              {imagesError && <p className="mt-3 text-xs text-rose-700" role="alert">{imagesError}</p>}
            </section>
          ) : (
            <section className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="about-image-admin-title">
              <button type="button" onClick={closeAdminDialog} disabled={imageBusy} className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50" aria-label="Close delete confirmation"><X size={18} /></button>
              <h2 id="about-image-admin-title" className="pr-8 text-lg font-bold text-slate-900">Delete image</h2>
              <p className="mt-2 text-sm text-slate-600">Delete this image from Cloudinary? This cannot be undone.</p>
              <p className="mt-2 truncate text-xs text-slate-500">{pendingAction.image.fileName || "About Us image"}</p>
              {imagesError && <p className="mt-3 rounded-lg bg-rose-50 p-2.5 text-xs text-rose-700" role="alert">{imagesError}</p>}
              <form onSubmit={submitAdminAction} className="mt-5 flex justify-end gap-2">
                <button type="button" onClick={closeAdminDialog} disabled={imageBusy} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={imageBusy} className="inline-flex items-center gap-2 rounded-xl bg-rose-700 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-800 disabled:opacity-50">
                  {imageBusy ? <LoaderCircle size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  {imageBusy ? "Working…" : "Delete image"}
                </button>
              </form>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
