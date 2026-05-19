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
