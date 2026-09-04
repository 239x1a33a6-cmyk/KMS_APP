/**
 * DuplicateDetector — a self-contained hook + inline warning banner.
 * Shows a non-blocking alert when the user types a title similar to an
 * existing resource. Uses a 600ms debounce.
 */
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import utilsService from "../services/utilsService";

const useDuplicateDetection = (title) => {
    const [matches, setMatches] = useState([]);
    const timerRef = useRef(null);

    useEffect(() => {
        clearTimeout(timerRef.current);

        if (!title || title.trim().length < 3) {
            setMatches([]);
            return;
        }

        timerRef.current = setTimeout(async () => {
            try {
                const res = await utilsService.getSimilarTitles(title.trim());
                setMatches(res.data?.data || []);
            } catch {
                setMatches([]);
            }
        }, 600);

        return () => clearTimeout(timerRef.current);
    }, [title]);

    return matches;
};

const DuplicateWarning = ({ title }) => {
    const matches = useDuplicateDetection(title);

    if (matches.length === 0) return null;

    return (
        <div className="duplicate-warning" role="alert">
            <strong>⚠️ Similar resource{matches.length > 1 ? "s" : ""} found:</strong>
            <ul className="duplicate-list">
                {matches.map((m) => (
                    <li key={m._id}>
                        <Link to={`/resources/${m._id}`} target="_blank" rel="noreferrer">
                            {m.title}
                        </Link>{" "}
                        <span className="duplicate-type">({m.type})</span>
                    </li>
                ))}
            </ul>
            <small>You can still save — this is just a heads-up.</small>
        </div>
    );
};

export { useDuplicateDetection };
export default DuplicateWarning;
