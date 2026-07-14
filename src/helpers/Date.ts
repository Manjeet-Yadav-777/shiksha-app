export function formatDate(date?: string): string {
    const formatted = new Date(date || "").toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  
    return formatted || "";
  }