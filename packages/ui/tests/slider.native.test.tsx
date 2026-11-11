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
    await app.getByTestId("opacity").dragBy(bounds.width * 0.3, 0);
    expect(await app.getByTestId("opacity-value").textContent()).toBe("80%");
    const thumb = await app.getByTestId("opacity-thumb").bounds();
    const rail = await app.getByTestId("opacity-rail").bounds();
    expect(Math.abs(thumb.y + thumb.height / 2 - (rail.y + rail.height / 2))).toBeLessThan(2);
    expect(Math.abs(thumb.x + thumb.width / 2 - (rail.x + rail.width * 0.8))).toBeLessThan(2);
  } finally {
    await app.close();
    root.unmount();
  }
});

test("disabled sliders ignore pointer and keyboard input", async () => {
  const root = createTestRoot({ width: 400, height: 200, keyboardFocusDim: false });
  const app = await connectTest(root.renderer);
  function Fixture() {
    const [value, setValue] = useState(50);
    return <Slider label="Disabled" testId="disabled" value={value} onChange={setValue} disabled />;
  }
  try {
    root.render(<Fixture />);
    await app.getByTestId("disabled").click();
    await app.getByTestId("disabled").press("right");
    expect(await app.getByTestId("disabled-value").textContent()).toBe("50");
  } finally {
    await app.close();
    root.unmount();
  }
});
