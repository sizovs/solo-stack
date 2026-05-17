class HtmlResult {
  constructor(content) {
    this.content = content;
  }
  render() {
    return new Response(this.content, {
      headers: { "Content-Type": "text/html" },
    });
  }
}

const escape = (text) => {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
};

export const html = (fragments, ...values) => {
  let content = "";

  const renderValue = (value, rawFlag) => {
    if (Array.isArray(value))
      return value.map((v) => renderValue(v, rawFlag)).join("");
    if (typeof value === "object" && value !== null && "render" in value)
      return value.content;
    if (typeof value === "string" || typeof value === "number")
      return rawFlag ? String(value) : escape(String(value));

    return "";
  };

  fragments.forEach((string, i) => {
    const rawFlag = string.endsWith("$");
    content += rawFlag ? string.slice(0, -1) : string;
    if (i < values.length) content += renderValue(values[i], rawFlag);
  });

  return new HtmlResult(content);
};
