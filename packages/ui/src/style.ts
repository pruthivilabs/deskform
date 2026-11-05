import type { StyleDesc } from "@gpuix/react";

export function style(...layers: (StyleDesc | false | null | undefined)[]): StyleDesc {
  let result: StyleDesc = {};
  for (const layer of layers) {
    if (!layer) continue;
    result = {
      ...result,
      ...layer,
      hover: { ...result.hover, ...layer.hover },
      active: { ...result.active, ...layer.active },
      focusVisible: { ...result.focusVisible, ...layer.focusVisible },
    };
  }
  return result;
}
