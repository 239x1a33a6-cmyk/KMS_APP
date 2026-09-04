/**
 * SpotlightSearch — triggered by Ctrl+K / Cmd+K.
 * Shows a modal overlay with a live-search input that queries the backend
 * and lets the user navigate results with arrow keys and Enter.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import utilsService from "../services/utilsService";

const TYPE_ICONS = {
    NOTE: "📄",
    ARTICLE: "📰",
    LINK: "🔗",
    CODE: "💻",
    DOCUMENT: "📂",
};

const SpotlightSearch = ({ open, onClose }) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(0);
    const inputRef = useRef(null);
    const timerRef = useRef(null);
    const navigate = useNavigate();

    // Focus input when opened
    useEffect(() => {
        if (open) {
            setQuery("");
            setResults([]);
            setSelected(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    // Debounced search
    useEffect(() => {
        if (!open) return;
        clearTimeout(timerRef.current);

        if (!query.trim()) {
            setResults([]);
            return;
        }

        timerRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await utilsService.search(query);
                setResults(res.data?.data || []);
                setSelected(0);
            } catch {
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 250);

        return () => clearTimeout(timerRef.current);
    }, [query, open]);

    const goTo = useCallback(
        (id) => {
            onClose();
            navigate(`/resources/${id}`);
        },
        [navigate, onClose],
    );

    // Keyboard navigation
    const handleKeyDown = (e) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelected((s) => Math.min(s + 1, results.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelected((s) => Math.max(s - 1, 0));
        } else if (e.key === "Enter" && results[selected]) {
            goTo(results[selected]._id);
        } else if (e.key === "Escape") {
            onClose();
        }
    };

    if (!open) return null;

    return (
        <div
            className="spotlight-backdrop"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Search resources"
        >
            <div
                className="spotlight-panel"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Input */}
                <div className="spotlight-input-row">
                    <span className="spotlight-icon">⌘</span>
                    <input
                        ref={inputRef}
                        className="spotlight-input"
                        type="text"
                        placeholder="Search resources…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoComplete="off"
                    />
                    {loading && <span className="spotlight-spinner" />}
                    <kbd className="spotlight-esc" onClick={onClose}>
                        esc
                    </kbd>
                </div>

                {/* Results */}
                {results.length > 0 && (
                    <ul className="spotlight-results">
                        {results.map((r, i) => (
                            <li
                                key={r._id}
                                className={`spotlight-item${i === selected ? " spotlight-item--active" : ""}`}
                                onClick={() => goTo(r._id)}
                                onMouseEnter={() => setSelected(i)}
                            >
                                <span className="spotlight-type-icon">
                                    {TYPE_ICONS[r.type] || "📄"}
                                </span>
                                <span className="spotlight-item-title">{r.title}</span>
                                <span className="spotlight-item-meta">
                                    {r.category || r.type}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}

                {query.trim() && !loading && results.length === 0 && (
                    <p className="spotlight-empty">No resources found for "{query}"</p>
                )}

                {!query.trim() && (
                    <p className="spotlight-hint">
                        Type to search across all your resources…
                    </p>
                )}
            </div>
        </div>
    );
};

export default SpotlightSearch;
