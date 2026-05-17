import { expect } from "chai";
import { describe, it } from "node:test";

import { html } from "./html.js";

describe("html", () => {
  it("should preserve the string literal value", () => {
    expect(html`Hello, world!`.content).eq("Hello, world!");
  });

  it("should interpolate variables", () => {
    const name = "Brad";
    expect(html`Hello, ${name}!`.content).eq("Hello, Brad!");
    expect(html`<html version="${123}"></html>`.content).eq(
      `<html version="123"></html>`,
    );
  });

  it("should escape HTML symbols to prevent injection", () => {
    const userInput = `<img src=x alt="x&" onerror=alert('XSS')>`;
    expect(html`User input: ${userInput}`.content).eq(
      `User input: &lt;img src=x alt=&quot;x&amp;&quot; onerror=alert(&apos;XSS&apos;)&gt;`,
    );
  });

  it("should render $${unsafe} strings as is", () => {
    const userInput = `<img src=x alt="x&" onerror=alert('XSS')>`;
    expect(html`User input: $${userInput}`.content).eq(
      `User input: <img src=x alt="x&" onerror=alert('XSS')>`,
    );
  });

  it("should generate valid HTML with an array of values", () => {
    const names = ["Megan", "Tiphaine", "Florent", "Hoan"];
    expect(
      html`<div>
        My best friends are:
        <ul>
          ${names.map((name) => html`<li>${name}</li>`)}
        </ul>
      </div>`.content,
    ).eq(
      `<div>
        My best friends are:
        <ul>
          <li>Megan</li><li>Tiphaine</li><li>Florent</li><li>Hoan</li>
        </ul>
      </div>`,
    );
  });
});
