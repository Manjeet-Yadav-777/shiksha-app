import { Link } from "react-router-dom";

export function NavLink({
  to,
  style,
  children,
  color = "white",
  fw = "normal",
}: {
  to: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  color?: string;
  fw?: "bold" | "semibold" | "normal";
}) {
  return (
    <Link
      to={to}
      style={{
        color: color,
        textDecoration: "none",
        fontSize: "14px",
        fontWeight: fw,
        ...style,
      }}
    >
      {children}
    </Link>
  );
}
