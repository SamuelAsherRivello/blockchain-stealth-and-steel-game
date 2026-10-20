---
name: ai-skills-create-youtube-thumbnail
description: "Use when a public repository or README and YouTube video URL need a linked, pre-baked video thumbnail in the README."
---

# Create a YouTube README thumbnail

Use this skill when the user supplies a public repository or README URL plus a YouTube video URL, and wants the lead README image replaced by a linked, pre-baked video thumbnail.

## Inputs

Obtain two arguments:

1. The public repository or README URL.
2. The public YouTube video URL.

Resolve a repository URL to its default-branch `README.md`. For a README URL, edit that file when the user has placed its checkout in scope. Do not attempt to modify a remote repository without authorization and write access.

## README change

At the top of the README, identify this lead sequence when it exists:

1. README content.
2. A banner image.
3. The next standalone image.
4. The title.

Preserve the banner and title. Remove only item 3. Insert this content at that location:

```markdown
# YouTube

[![YouTube video thumbnail](https://example.com/MARKETING_ASSET_PATH)](VIDEO_URL)
```

Replace the example image URL with the repository-relative final asset path, and replace `VIDEO_URL` with the supplied canonical video URL. Leave the existing title and all later README content unchanged.

Download the HD thumbnail from `https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg`. If it is unavailable, use `https://img.youtube.com/vi/VIDEO_ID/hqdefault.jpg`. Create a new pre-baked PNG from that thumbnail for every request. It must have a centered translucent red rounded-rectangle play control, a white right-pointing play triangle, a soft shadow behind the control, and a 1px light-gray outer border. Store the final PNG in `docs/marketing/` and use its repository-relative path as `MARKETING_ASSET_PATH`. Do not vendor the unmodified thumbnail or a separate overlay asset.

## Constraints

Use ordinary Markdown to link the final pre-baked marketing asset to the video. GitHub README sanitization removes the CSS needed to layer images and apply visual effects, so do not use HTML styles for the play control, shadow, or border.

If the expected banner, following image, and title sequence is ambiguous, inspect the README and ask the user to identify the image to replace rather than removing another image.
