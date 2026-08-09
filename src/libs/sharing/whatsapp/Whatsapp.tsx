import { Box, Button, Container, Stack } from '@mantine/core';
import { IconBrandWhatsapp, IconCheck, IconCopy } from '@tabler/icons-react';
import { Inline } from '../../basic/Layout';
import { useState } from 'react';
import { Markdown } from '../../Markdown/Markdown';

export function ShareViaWhatsApp({
  contentToShare,
  phoneNumber,
}: {
  contentToShare: string;
  phoneNumber: string;
}) {
  const [copied, setCopied] = useState(false);

  const content = formatWhatsappMarkdown(contentToShare);

  const handleWaShare = () => {
    const message = markdownToWhatsApp(content);

    const params = new URLSearchParams({
      phone: phoneNumber,
      text: message,
    });

    window.open(`https://api.whatsapp.com/send?${params.toString()}`, '_blank');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdownToWhatsApp(content));
      setCopied(true);

      const timer = setTimeout(() => {
        setCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    } catch (error) {
      alert('failed to copy' + error);
    }
  };

  return (
    <Container fluid px={'xl'}>
      <Box px={'lg'} py={'lg'} bg="#FAF7EB">
        <Stack px="xl" py="xl">
          <Box bg="#DDF8C6" bdrs="md" px="xl" py="md" fz="sm">
            <Markdown>{content}</Markdown>
          </Box>

          <Inline gap="lg">
            <Button
              bg="green"
              size="sm"
              leftSection={<IconBrandWhatsapp size={18} />}
              onClick={handleWaShare}
            >
              Send Via Whatsapp
            </Button>

            <Button
              onClick={handleCopy}
              variant="default"
              size="sm"
              leftSection={
                copied ? <IconCheck size={14} /> : <IconCopy size={14} />
              }
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </Inline>
        </Stack>
      </Box>
    </Container>
  );
}

function markdownToWhatsApp(markdown: string) {
  return (
    markdown
      //remove nbsp
      .replace(/^\s*&nbsp;\s*$/gm, '')

      // Headings -> Bold
      .replace(/^### (.*)$/gm, '*$1*')
      .replace(/^## (.*)$/gm, '*$1*')
      .replace(/^# (.*)$/gm, '*$1*')

      // Bold
      .replace(/\*\*(.*?)\*\*/g, '*$1*')

      // Italic
      .replace(/_(.*?)_/g, '_$1_')

      // Remove code fences
      .replace(/```([\s\S]*?)```/g, '$1')

      // Inline code
      .replace(/`([^`]+)`/g, '`$1`')
  );
}

function formatWhatsappMarkdown(content: string) {
  return content.replace(
    /---/g,
    `&nbsp;

---

&nbsp;`,
  );
}
