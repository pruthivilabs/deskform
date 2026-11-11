import { expect, test } from "bun:test";
import { connectTest } from "@gpuix/react/automation";
import { createTestRoot } from "@gpuix/react/testing";
import { useState } from "react";
import { Slider } from "../src";

test("slider changes a controlled value with keyboard and pointer", async () => {
  const root = createTestRoot({ width: 400, height: 200, keyboardFocusDim: false });
  const app = await connectTest(root.renderer);
  function Fixture() {
    const [value, setValue] = useState(0.5);
    return (
      <Slider
        label="Opacity"
        testId="opacity"
        min={0}
        max={1}
        step={0.1}
        value={value}
        onChange={setValue}
        formatValue={(n) => `${Math.round(n * 100)}%`}
      />
    );
  }
  try {
    root.render(<Fixture />);
    await app.getByTestId("opacity").press("right");
    expect(await app.getByTestId("opacity-value").textContent()).toBe("60%");
    await app.getByTestId("opacity").press("home");
    expect(await app.getByTestId("opacity-value").textContent()).toBe("0%");
    await app.getByTestId("opacity").press("end");
    expect(await app.getByTestId("opacity-value").textContent()).toBe("100%");
    const bounds = await app.getByTestId("opacity").bounds();
    root.renderer.nativeSimulateMouseDown(
      bounds.x + bounds.width * 0.3,
      bounds.y + bounds.height / 2,
    );
    root.renderer.nativeSimulateMouseUp(
      bounds.x + bounds.width * 0.3,
      bounds.y + bounds.height / 2,
    );
    expect(await app.getByTestId("opacity-value").textContent()).toBe("30%");
  } finally {
    await app.close();
    root.unmount();
  }
});
