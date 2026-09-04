/**
 * KeyboardShortcuts — global keyboard listener + "?" cheatsheet modal.
 *
 * Active shortcuts:
 *   n         → /resources/new
 *   d         → /dashboard
 *   r         → /resources
 *   f         → /favorites
 *   ?         → open cheatsheet modal
 *   Ctrl+K    → open Spotlight Search (triggers onSpotlight callback)
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SHORTCUTS = [
    { keys: ["Ctrl", "K"], label: "Open Spotlight Search" },
    { keys: ["?"], label: "Open this cheatsheet" },
    { keys: ["n"], label: "Create new resource" },
    { keys: ["d"], label: "Go to Dashboard" },
    { keys: ["r"], label: "Go to Resources" },
    { keys: ["f"], label: "Go to Favorites" },
    { keys: ["Esc"], label: "Close any open modal" },
];

const KeyboardShortcuts = ({ onSpotlight }) => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleKeyDown = (e) => {
            const tag = document.activeElement?.tagName?.toLowerCase();
            const isTyping =
                tag === "input" || tag === "textarea" || tag === "select";

            // Spotlight: Ctrl+K / Cmd+K — always active
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                onSpotlight?.();
                return;
            }

            // Navigation shortcuts — skip when user is typing
            if (isTyping) return;

            if (e.key === "?") {
                setOpen((prev) => !prev);
                return;
            }

            if (e.key === "Escape") {
                setOpen(false);
                return;
            }

            if (e.key === "n" && !e.ctrlKey && !e.metaKey) {
                navigate("/resources/new");
                return;
            }
            if (e.key === "d" && !e.ctrlKey && !e.metaKey) {
                navigate("/dashboard");
                return;
            }
            if (e.key === "r" && !e.ctrlKey && !e.metaKey) {
                navigate("/resources");
                return;
            }
            if (e.key === "f" && !e.ctrlKey && !e.metaKey) {
                navigate("/favorites");
                return;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [navigate, onSpotlight]);

    if (!open) return null;

    return (
        <div
            className="spotlight-backdrop"
            onClick={() => setOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Keyboard shortcuts"
        >
            <div
                className="spotlight-panel shortcuts-panel"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="shortcuts-header">
                    <h5 className="mb-0">⌨️ Keyboard Shortcuts</h5>
                    <kbd className="spotlight-esc" onClick={() => setOpen(false)}>
                        esc
                    </kbd>
                </div>
                <ul className="shortcuts-list">
                    {SHORTCUTS.map((s) => (
                        <li key={s.label} className="shortcut-row">
                            <span className="shortcut-label">{s.label}</span>
                            <span className="shortcut-keys">
                                {s.keys.map((k) => (
                                    <kbd key={k} className="shortcut-key">
                                        {k}
                                    </kbd>
                                ))}
                            </span>
                        </li>
                    ))}
                </ul>
                <p className="shortcuts-footer">Press ? anytime to toggle this panel</p>
            </div>
        </div>
    );
};

export default KeyboardShortcuts;
