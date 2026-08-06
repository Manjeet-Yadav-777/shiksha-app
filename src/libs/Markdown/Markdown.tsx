import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Props = {
  children: string;
};

export function Markdown({ children }: Props) {
  return (
    <ReactMarkdown
      components={{
        hr: () => (
          <hr
            style={{ height: '1px', backgroundColor: 'gray', border: 'none' }}
          />
        ),
      }}
      remarkPlugins={[remarkGfm]}
    >
      {children}
    </ReactMarkdown>
  );
}
