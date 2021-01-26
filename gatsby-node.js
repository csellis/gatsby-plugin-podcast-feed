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
                enclosure {
                  url
                  type
                }
              }
            }
          }
        }
      }
    `)
  );

  const { feedOptions } = pluginOptions || {};

  const episodes = result.data.allMarkdownRemark.edges;

  const feed = new RSS(feedOptions);

  episodes.forEach(edge => {
    const { html, excerpt, id } = edge.node;
    const { title, number, date, url, categories, enclosure } = edge.node.frontmatter;

    feed.item({
      guid: id,
      title,
      url,
      description: excerpt,
      categories,
      author: feedOptions.managingEditor,
      date,
      enclosure,
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
  if (!(await fs.stat(outputDir))) {
    await fs.mkdirp(outputDir);
  }
  await fs.writeFile(outputPath, feed.xml());
};
