/**
 * LinkPreviewCard — fetches Open Graph metadata for a URL and renders a
 * rich preview card. Shows a skeleton while loading.
 */
import { useEffect, useState } from "react";
import utilsService from "../services/utilsService";

const LinkPreviewCard = ({ url }) => {
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        if (!url) return;
        let cancelled = false;

        setLoading(true);
        setFailed(false);

        utilsService
            .getLinkPreview(url)
            .then((res) => {
                if (!cancelled) {
                    setPreview(res.data?.data || null);
                }
            })
            .catch(() => {
                if (!cancelled) setFailed(true);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [url]);

    if (!url) return null;

    if (loading) {
        return (
            <div className="link-preview-card link-preview-skeleton">
                <div className="link-preview-image-placeholder" />
                <div className="link-preview-body">
                    <div className="skeleton-line skeleton-line--title" />
                    <div className="skeleton-line skeleton-line--desc" />
                    <div className="skeleton-line skeleton-line--url" />
                </div>
            </div>
        );
    }

    if (failed || (!preview?.title && !preview?.description)) {
        return (
            <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline-dark btn-sm mt-2"
            >
                🔗 Open Link →
            </a>
        );
    }

    return (
        <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="link-preview-card"
        >
            {preview.image && (
                <img
                    src={preview.image}
                    alt={preview.title || "Preview"}
                    className="link-preview-image"
                    onError={(e) => {
                        e.target.style.display = "none";
                    }}
                />
            )}
            <div className="link-preview-body">
                {preview.title && (
                    <p className="link-preview-title">{preview.title}</p>
                )}
                {preview.description && (
                    <p className="link-preview-desc">{preview.description}</p>
                )}
                <p className="link-preview-url">
                    {new URL(url).hostname.replace(/^www\./, "")}
                </p>
            </div>
        </a>
    );
};

export default LinkPreviewCard;
