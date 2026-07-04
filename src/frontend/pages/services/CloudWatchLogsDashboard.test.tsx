// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { highlightLogLevels } from "./CloudWatchLogsDashboard";

describe("highlightLogLevels", () => {
  it("colors log level keywords", () => {
    const { container } = render(<>{highlightLogLevels("ERROR something failed")}</>);
    const span = container.querySelector("span");
    expect(span?.textContent).toBe("ERROR");
  });

  it("highlights [bracketed] chunks", () => {
    const { container } = render(<>{highlightLogLevels("[http-nio-8080-exec-1] request handled")}</>);
    const span = container.querySelector("span");
    expect(span?.textContent).toBe("[http-nio-8080-exec-1]");
    expect(span?.style.color).toBe("var(--sh-accent)");
  });

  it("colors a [LEVEL] bracket by its severity instead of the generic accent", () => {
    const { container } = render(<>{highlightLogLevels("[WARN] disk space low")}</>);
    const span = container.querySelector("span");
    expect(span?.textContent).toBe("[WARN]");
    expect(span?.style.color).toBe("var(--sh-warn)");
  });

  it("recognizes additional severity vocabularies (syslog, java.util.logging, generic)", () => {
    const cases: Array<[string, string]> = [
      ["CRITICAL", "var(--sh-fail)"],
      ["SEVERE", "var(--sh-fail)"],
      ["EXCEPTION", "var(--sh-fail)"],
      ["NOTICE", "var(--sh-info)"],
      ["SUCCESS", "var(--sh-ok)"],
      ["VERBOSE", "var(--sh-dim)"],
    ];
    for (const [word, color] of cases) {
      const { container } = render(<>{highlightLogLevels(`${word} something happened`)}</>);
      const span = container.querySelector("span");
      expect(span?.textContent).toBe(word);
      expect(span?.style.color).toBe(color);
    }
  });

  it("leaves plain text with no matches untouched", () => {
    const { container } = render(<>{highlightLogLevels("plain message, no matches here")}</>);
    expect(container.querySelectorAll("span").length).toBe(0);
    expect(container.textContent).toBe("plain message, no matches here");
  });
});
