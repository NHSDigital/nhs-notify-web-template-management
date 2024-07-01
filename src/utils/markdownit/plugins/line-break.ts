import MarkdownIt from 'markdown-it';

export function lineBreak(md: MarkdownIt) {
  const defaultRender = md.renderer.rules.text!;

  md.renderer.rules.text = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const content = token.content;

    // Replace double spaces with <br>
    const newContent = content.replace(/\s{2}/g, '<br>');

    return defaultRender(tokens, idx, options, env, self).replace(
      content,
      newContent
    );
  };
}
