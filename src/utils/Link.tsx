import { Link } from "react-router-dom";

export function NavLink({
  to,
  style,
  children,
  color = "white"
}: {
  to: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  color? : string
}) {
  return (
    <Link to={to} style={{color : color, textDecoration : "none", fontSize : "14px", ...style}}>
      {children}
    </Link>
  );
}
