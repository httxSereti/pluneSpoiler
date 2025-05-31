/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import definePlugin from "@utils/types";
import { findByPropsLazy } from "@webpack";

const SpoilerClasses = findByPropsLazy("spoilerContent");

export default definePlugin({
  name: "pluneSpoiler",
  description: "Disable being allowed to be Spoilered",
  authors: [{
    id: 939288874281222225n,
    name: "httx.sereti"
  }],

  patches: [
    {
      find: ".removeObscurity,",
      replacement: {
        match: /(?<="removeObscurity",(\i)=>{)/,
        replace: (_, event) => `$self.reveal(${event});\nreturn;`
      }
    }
  ],

  reveal(event: MouseEvent) {
    const { ctrlKey, shiftKey, target } = event;
    const { spoilerContent, hidden } = SpoilerClasses;
    // do stuff here for later
    return;
  }

});
