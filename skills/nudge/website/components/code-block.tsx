import { codeToHtml } from "shiki";

const USAGE_CODE = `<script src="budge.iife.js"></script>
<script>
  Budge.widget.mount(document.body, {
    config: {
      property: "font-size",
      value: "16px",
      original: "16px",
      type: "numeric",
      min: 8,
      max: 72,
    },
  });
</script>`;

export async function CodeBlock() {
  const html = await codeToHtml(USAGE_CODE, {
    lang: "html",
    theme: "github-light",
  });

  return (
    <div
      className="mt-4 rounded-[14px] overflow-hidden text-[13px]/[20px] border border-solid border-[color(display-p3_1_1_1)] [box-shadow:#0000000F_0px_0px_0px_1px,#0000000F_0px_1px_2px_-1px,#0000000A_0px_2px_4px] [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:m-0 [&_pre]:bg-[color(display-p3_0.991_0.991_0.991)!important] font-mono-override"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
