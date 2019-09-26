const fs = require('fs-extra');
const path = require('path');
const RSS = require('rss');

const wrapper = promise =>
  promise.then(result => {
    if (result.errors) {
      throw result.errors;
    }
    return result;
  });

exports.onPostBuild = async ({ graphql }, pluginOptions) => {
  const result = await wrapper(
    graphql(`
      {
        allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
          edges {
            node {
              excerpt
              html
              id
              frontmatter {
                title
                categories
                url
                number
                date
              }
            }
          }
        }
      }
    `)
  );

  const { feedOptions, isContentLocal } = pluginOptions || {};

  const episodes = result.data.allMarkdownRemark.edges;

  const feed = new RSS(feedOptions);

  episodes.forEach(edge => {
    const { html, excerpt, id } = edge.node;
    const { title, number, date, categories } = edge.node.frontmatter;
    let url = '';

    if (isContentLocal) {
      if (!feedOptions.site_url) {
        throw new Error(
          'site_url must be defined on feedOptions when content is local'
        );
      }

      url = `${feedOptions.site_url}/${edge.node.frontmatter.url}`;
    } else {
      url = edge.node.frontmatter.url;
    }

    feed.item({
      guid: id,
      title,
      url,
      description: excerpt,
      categories,
      author: feedOptions.managingEditor,
      date,
      custom_elements: [
        { 'content:encoded': html },
        { pubDate: date },
        { 'itunes:explicit': 'no' },
        { 'itunes:episodeType': 'full' },
        { 'itunes:title': title },
        { 'itunes:episode': number },
        { 'itunes:summary': excerpt },
        { 'itunes:author': feedOptions.managingEditor },
        {
          'itunes:image': {
            _attr: {
              href: feedOptions.image_url,
            },
          },
        },
      ],
    });
  });

  const publicPath = `./public`;
  const outputPath = path.join(publicPath, '/rss.xml');
  const outputDir = path.dirname(outputPath);
  if (!(await fs.exists(outputDir))) {
    await fs.mkdirp(outputDir);
  }
  await fs.writeFile(outputPath, feed.xml());
};
