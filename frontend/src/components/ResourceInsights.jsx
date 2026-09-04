/**
 * ResourceInsights — shows word count, estimated read time, and link count
 * for a resource. Purely computed from the content string; no API call needed.
 */
const ResourceInsights = ({ content, type }) => {
    if (!content || (type !== "NOTE" && type !== "ARTICLE" && type !== "CODE")) {
        return null;
    }

    const words = content.trim().split(/\s+/).filter(Boolean).length;
    const readMinutes = Math.max(1, Math.ceil(words / 200));
    const linkCount = (content.match(/https?:\/\/[^\s]+/g) || []).length;
    const lineCount = content.split("\n").length;

    return (
        <div className="resource-insights">
            <span className="insight-chip" title="Word count">
                📝 {words.toLocaleString()} words
            </span>
            <span className="insight-chip" title="Estimated reading time at 200 wpm">
                ⏱ {readMinutes} min read
            </span>
            {type === "CODE" && (
                <span className="insight-chip" title="Lines of code">
                    🔢 {lineCount} lines
                </span>
            )}
            {linkCount > 0 && (
                <span className="insight-chip" title="Links referenced in content">
                    🔗 {linkCount} link{linkCount !== 1 ? "s" : ""}
                </span>
            )}
        </div>
    );
};

export default ResourceInsights;
