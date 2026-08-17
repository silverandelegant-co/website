const markdownIt = require("markdown-it")();

module.exports = function(eleventyConfig) {
  // Copy the `assets` and `admin` folders directly to the output
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.addPassthroughCopy("CNAME");

  // Normalize image paths — strips leading slash to prevent double-slash
  // when templates already prepend "/" (e.g. src="/{{ path }}")
  // Handles both "assets/pieces/img.jpg" and "/assets/pieces/img.jpg"
  eleventyConfig.addFilter("imgpath", (path) => {
    if (!path) return path;
    return path.replace(/^\/+/, "");
  });

  // Reverse string filter for email obfuscation
  eleventyConfig.addFilter("reverseString", (str) => {
    if (!str) return "";
    return str.split("").reverse().join("");
  });

  // Helper: Extract FILE_ID from various Google Drive URL formats
  function extractDriveFileId(url) {
    if (!url) return '';
    if (url.includes('lh3.googleusercontent.com/d/')) {
      const parts = url.split('lh3.googleusercontent.com/d/');
      return parts[1] ? parts[1].split('?')[0].split('/')[0] : '';
    }
    const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch) return fileMatch[1];

    const openMatch = url.match(/(?:[?&]|&amp;)id=([a-zA-Z0-9_-]+)/);
    if (openMatch) return openMatch[1];

    if (/^[a-zA-Z0-9_-]{25,}$/.test(url)) return url;
    return '';
  }

  // Optimized Thumbnail using direct lh3 CDN with size parameter (default sz=s600)
  eleventyConfig.addFilter("drivethumb", (url, width = 600) => {
    if (!url) return '';
    const fileId = extractDriveFileId(url);
    if (fileId) {
      return `https://lh3.googleusercontent.com/d/${fileId}=s${width}`;
    }
    return url;
  });

  // Full-size direct image URL for Lightbox, Hero & Full View
  eleventyConfig.addFilter("driveimage", (url) => {
    if (!url) return '';
    const fileId = extractDriveFileId(url);
    if (fileId) {
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
    return url;
  });

  // Beautiful date formatter (e.g., "18 May 2026")
  eleventyConfig.addFilter("postDate", (dateObj) => {
    if (!dateObj) return "";
    const date = new Date(dateObj);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  });

  // ISO date string for datetime attributes
  eleventyConfig.addFilter("dateIso", (dateObj) => {
    if (!dateObj) return "";
    try {
      return new Date(dateObj).toISOString().split('T')[0];
    } catch(e) {
      return "";
    }
  });

  // Markdown renderer filter
  eleventyConfig.addFilter("markdown", (content) => {
    if (!content) return "";
    return markdownIt.render(content);
  });

  // Extract YouTube ID and return the standard embed URL
  eleventyConfig.addFilter("youtubeEmbed", (url) => {
    if (!url) return "";
    let videoId = "";
    const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/i);
    if (watchMatch && watchMatch[1]) {
      videoId = watchMatch[1];
    } else {
      const directIdMatch = url.match(/^[a-zA-Z0-9_-]{11}$/);
      if (directIdMatch) {
        videoId = url;
      }
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
  });

  // Output configuration
  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["html", "njk", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
