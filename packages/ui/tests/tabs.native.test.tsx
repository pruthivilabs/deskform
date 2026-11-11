import { expect, test } from "bun:test";
import { connectTest } from "@gpuix/react/automation";
import { createTestRoot } from "@gpuix/react/testing";
import { useState } from "react";
import { Tabs, Text } from "../src";

test("tabs select views by pointer and keyboard", async () => {
  const root = createTestRoot({ width: 500, height: 200, keyboardFocusDim: false });
  const app = await connectTest(root.renderer);
  function Fixture() {
    const [value, setValue] = useState("first");
    return (
      <div>
        <Tabs
          label="Views"
          value={value}
          onChange={setValue}
          tabs={[
            { id: "first", label: "First" },
            { id: "second", label: "Second" },
          ]}
        />
        <Text testId="content">{value}</Text>
      </div>
    );
  }
  try {
    root.render(<Fixture />);
    await app.getByTestId("tabs-second").click();
    expect(await app.getByTestId("content").textContent()).toBe("second");
    await app.getByTestId("tabs-second").press("right");
    expect(await app.getByTestId("content").textContent()).toBe("first");
    expect(root.renderer.getFocusedElementId()).toBe(
      (await app.getByTestId("tabs-first").element()).id,
    );
  } finally {
    await app.close();
    root.unmount();
  }
});
