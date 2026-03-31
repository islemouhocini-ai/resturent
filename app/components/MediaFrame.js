export default function MediaFrame({
  media,
  className = "",
  priority = false
}) {
  if (!media?.src) {
    return null;
  }

  const classes = ["media-frame", className].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      <img
        className="media-frame__image"
        src={media.src}
        alt={media.alt || ""}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
