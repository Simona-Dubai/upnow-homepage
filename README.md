# UpNow — Download package

## 1. For Figma (static frames, no JavaScript)
Open any of these in Chrome, then capture them with an HTML-to-Figma plugin (e.g. "html.to.design"). Every `section.fm` is one frame, and its name is in `data-frame`.

- **UpNow Figma Frames.html**: the latest Home and Search pages. There are 39 frames at 1440px: Home for each vertical (with its matching hero image), and Search for every offering (search fields plus the exact blueprint filters, with the filter panel open). Star ratings are removed from the product cards, and the image tags are aligned.

Note: the frames in figma-prototypes/ are the earlier flow. The updated Home/Search visuals (new categories, contextual hero images, blueprint filters, cleaned cards) are in **UpNow Figma Frames.html**.

## 2. Working HTML (interactive)
Open **Home.html** in a browser. It links to **Search.html** and **Listing.html**. Keep the `css/`, `js/` and `img/` folders next to the pages.
- `js/data.js`: verticals, offerings, search fields and filters (per the UpNow blueprint), plus mock listings
- `js/common.js`: header, cards, filter engine, URL state, call / WhatsApp / request
- `js/filters-ui.js`: search bar and filter controls

## Images to replace before production
`img/family1.jpg` has a small watermark, and `img/lab1.jpg` is low-resolution.
