export const autoScanTOC = async (pdfDoc: any) => {
  const maxPagesToScan = Math.min(30, pdfDoc.numPages);
  let autoOutline: any[] = [];
  let foundTocHeader = false;

  for (let i = 1; i <= maxPagesToScan; i++) {
    try {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      const items = textContent.items;

      const linesMap = new Map<number, { str: string; x: number }[]>();

      for (const item of items) {
        if (!item.str.trim()) continue;
        
        let foundY = -1;
        for (const y of linesMap.keys()) {
          if (Math.abs(y - item.transform[5]) < 4) { // 4px tolerance
            foundY = y;
            break;
          }
        }
        const y = foundY !== -1 ? foundY : Math.round(item.transform[5]);

        if (!linesMap.has(y)) {
          linesMap.set(y, []);
        }
        linesMap.get(y)!.push({ str: item.str, x: item.transform[4] });
      }

      const sortedYs = Array.from(linesMap.keys()).sort((a, b) => b - a);
      let pageOutline: any[] = [];
      let pageHasTocHeader = false;

      for (const y of sortedYs) {
        const lineItems = linesMap.get(y)!;
        lineItems.sort((a, b) => a.x - b.x);
        
        // Sometimes spaces are already included in str, so just join directly if we want, or use a space if they are far apart.
        // Let's just join with space and then replace multiple spaces with single space
        let lineText = lineItems.map(i => i.str).join(' ').replace(/\s+/g, ' ').trim();

        if (/mục\s*lục|table\s*of\s*contents|contents/i.test(lineText)) {
          pageHasTocHeader = true;
          foundTocHeader = true;
        }

        // Match line ending with a number (page number)
        // e.g. "Chapter 1 . . . . . . 12"
        const match = lineText.match(/^(.*?)(?:[\.\s_-]+)(\d+)$/);
        if (match) {
          let title = match[1].replace(/[\.\s_-]+$/, '').trim();
          let pageNum = parseInt(match[2], 10);

          if (title && pageNum > 0 && title.length > 2 && !/^\d+$/.test(title)) {
            pageOutline.push({
              title: title,
              dest: { autoPageNum: pageNum },
              items: []
            });
          }
        }
      }

      // If we found a TOC header previously or on this page, and there are entries, add them
      // Or if a page just has a lot of TOC-like entries (e.g., > 3), it's probably a TOC page
      if ((foundTocHeader || pageOutline.length > 3) && pageOutline.length > 0) {
        autoOutline.push(...pageOutline);
      } else if (foundTocHeader && pageOutline.length === 0 && autoOutline.length > 0) {
        // If we already started collecting TOC but this page has none, we might have passed the TOC.
        // We could break here to save time, but let's just continue up to maxPagesToScan just in case.
      }
    } catch (e) {
      console.warn(`Failed to scan page ${i} for TOC:`, e);
    }
  }

  return autoOutline;
};
