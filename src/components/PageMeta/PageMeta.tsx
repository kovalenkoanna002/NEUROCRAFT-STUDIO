import { useEffect } from "react";

interface Props {
  title: string;
  description?: string;
}

const SITE = "NeuroCraft Studio";

export const PageMeta: React.FC<Props> = ({ title, description }) => {
  useEffect(() => {
    const prev = document.title;
    document.title = `${title} — ${SITE}`;

    let meta: HTMLMetaElement | null = null;
    let prevDescription: string | null = null;
    if (description) {
      meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "description";
        document.head.appendChild(meta);
      }
      prevDescription = meta.getAttribute("content");
      meta.setAttribute("content", description);
    }

    return () => {
      document.title = prev;

      if (meta && prevDescription !== null) {
        meta.setAttribute("content", prevDescription);
      }
    };
  }, [title, description]);

  return null;
};
