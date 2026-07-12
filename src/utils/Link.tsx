import { Link } from "react-router-dom";

export function NavLink({
  to,
  style,
  children,
}: {
  to: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <Link to={to} style={{color : "white", textDecoration : "none", fontSize : "16px", ...style}}>
      {children}
    </Link>
  );
}
