# Project Page Template

Every project page shares this skeleton so the site feels like one family. Individual project files override
or extend sections. The **hero** deliberately mirrors the preserved 3D printer hero (title → short rule →
subtitle → "Tools Used" chips) so the printer page doesn't feel like an outlier.

## STEP 0 (every project session)
Before writing code, ask Ansh:
> "What do you already have for **<project>**? (photos, renders, CAD files, videos, drawings, data, plots,
> write-ups, slides, links). Drop them in `assets-src/<slug>/` or tell me where they are."

Then compare against the page's "Assets requested" list, say what's missing, and confirm the section plan
before building.

## Sections

| # | Section | Contents |
|---|---|---|
| 1 | **Hero** | Full-screen. Back link (`← BACK` mono). Title (display `--h1`), 64px rule, subtitle, `TOOLS USED` mono label + `ToolChips`. Period + role as a spec line. Hero visual: 3D model in `dark-studio` (or a render/photo). Scroll cue. |
| 2 | **The Goal** | Centered, 1–2 short paragraphs, the problem + constraints. |
| 3 | **Specs / Requirements** | Label/value rows separated by dotted rules (printer-page pattern) + a visual. |
| 4 | **Build chapters** | Badge Factory chapters: `0N / NAME` eyebrow, title (2nd line orange), body, mono spec line, media/3D on the right. Progress counter bottom bar + dot nav. 3D assembly/exploded view advances per chapter where possible. |
| 5 | **Results** | Stat blocks (big numbers + mono labels), photos of the finished thing, video PIP. |
| 6 | **What I'd do next / lessons** | Short, honest. Optional. |
| 7 | **Next project** | Full-width link to the next project in order with its poster/model. Then footer. |

## Shared components
`ProjectHero`, `GoalSection`, `SpecsSection`, `Chapter`, `ModelViewer`, `Stat`, `VideoPip`, `NextProject`
(see ARCHITECTURE.md). Data for hero/tools/specLine comes from `content/projects.ts`.

## Each project file contains
1. STEP 0 questions specific to that project
2. Story arc & section spec (copy drafts from the résumé — factual only)
3. 3D treatment
4. Assets requested from Ansh (checklist with formats)
5. Questions for Ansh (with `Answer:` lines)
6. Done when
