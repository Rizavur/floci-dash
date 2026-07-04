// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { highlightLogLevels, renderLogMessage } from "./CloudWatchLogsDashboard";

describe("highlightLogLevels", () => {
  it("colors log level keywords", () => {
    const { container } = render(<>{highlightLogLevels("ERROR something failed")}</>);
    const span = container.querySelector("span");
    expect(span?.textContent).toBe("ERROR");
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

describe("renderLogMessage", () => {
  it("renders a JSON object message as key=value fields", () => {
    const { container } = render(
      <>{renderLogMessage('{"level":30,"avStatus":"PASSED","msg":"AV status updated"}')}</>,
    );
    expect(container.textContent).toBe("level=30avStatus=PASSEDmsg=AV status updated");
  });

  it("falls back to level highlighting for non-JSON messages", () => {
    const { container } = render(<>{renderLogMessage("ERROR something failed")}</>);
    const span = container.querySelector("span");
    expect(span?.textContent).toBe("ERROR");
  });

  it("falls back to plain text for JSON arrays", () => {
    const { container } = render(<>{renderLogMessage("[1,2,3]")}</>);
    expect(container.textContent).toBe("[1,2,3]");
  });
});
