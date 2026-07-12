import { Flex, type FlexProps } from "@mantine/core";

interface InlineProps extends FlexProps {
  children: React.ReactNode;
}

export function Inline({ children, ...props }: InlineProps) {
  return <Flex {...props}>{children}</Flex>;
}

export function Heading({
  as = "h2",
  children,
  style,
  color = "#000"
}: {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  children: React.ReactNode;
  style?: React.CSSProperties;
  color? : string

}) {
  const Element = as;
  return <Element style={{color : color , ...style}}>{children}</Element>;
}
