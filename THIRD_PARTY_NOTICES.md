# Third-party notices

WhatStatus bundles the following assets inside `WhatStatus.exe`:

| Asset | Used for | License |
|---|---|---|
| [Inter](https://github.com/rsms/inter) by Rasmus Andersson (`fonts/Inter-*.ttf`, static instances served by Google Fonts) | Installer text | [SIL Open Font License 1.1](https://openfontlicense.org) |
| [Material Symbols Rounded](https://github.com/google/material-design-icons) by Google (`fonts/MSym*.ttf`, icon subsets served by Google Fonts) | Installer icons | [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0) |

Fetched at runtime, not redistributed:

- Discord's public list of detectable games (`https://discord.com/api/v10/applications/detectable`), cached locally to recognise running games.
- WhatsApp's own UI components and icons, used in place inside WhatsApp Desktop to draw the Status settings page. `ui-src/wa-templates.json` contains markup structure (element and class names) captured from WhatsApp Desktop so that page matches WhatsApp's look.

WhatsApp is a trademark of WhatsApp LLC / Meta Platforms, Inc. Discord and Spotify are trademarks of their respective owners. WhatStatus is not affiliated with or endorsed by any of them.
