Create an RSS feed for podcasts with your Gatsby Site. While gatsby-plugin-feed is great for creating RSS feeds for blogs, it is difficult to make the iTunes custom_elements found in the RSS [package](https://www.npmjs.com/package/rss).

## Install

`npm install --save gatsby-plugin-podcast-feed`

## How to use

### gatsby-config.js
```
// In your gatsby-config.js

const feedOptions = {
    title: 'title',
    description: 'description',
    feed_url: 'http://example.com/rss.xml',
    site_url: 'http://example.com',
    image_url: 'http://example.com/icon.png',
    docs: 'http://example.com/rss/docs.html',
    managingEditor: 'Dylan Greene',
    webMaster: 'Dylan Greene',
    copyright: '2013 Dylan Greene',
    language: 'en',
    categories: ['Category 1','Category 2','Category 3'],
    pubDate: 'May 20, 2019 04:00:00 GMT',
    ttl: '60',
    custom_namespaces: {
      'itunes': 'http://www.itunes.com/dtds/podcast-1.0.dtd'
    },
    custom_elements: [
      {'itunes:subtitle': 'A show about everything'},
      {'itunes:author': 'John Doe'},
      {'itunes:summary': 'All About Everything is a show about everything. Each week we dive into any subject known to man and talk about it as much as we can. Look for our podcast in the Podcasts app or in the iTunes Store'},
      {'itunes:owner': [
        {'itunes:name': 'John Doe'},
        {'itunes:email': 'john.doe@example.com'}
      ]},
      {'itunes:image': {
        _attr: {
          href: 'http://example.com/podcasts/everything/AllAboutEverything.jpg'
        }
      }},
      {'itunes:category': [
        {_attr: {
          text: 'Technology'
        }},
        {'itunes:category': {
          _attr: {
            text: 'Gadgets'
          }
        }}
      ]}
    ]
}

module.exports = {
    plugins: [
        {
            resolve: `gatsby-plugin-podcast-feed`,
            options: {
                feedOptions
            },
        }
    ]
}

```

### Your Markdown Files

```
---
number: 1
title: "Introduction"
slug: "introduction"
date: "2019-04-06"
url: https://traffic.libsyn.com/lkajsdlkfjalksdjf/alskdjflkjasdf.mp3
categories:
  - Ohh Oh
  - It's magic
---

You know.
```

This plugin tries to follow the naming conventions defined in the RSS [package](https://www.npmjs.com/package/rss). Please refer to its documentation for more information about each field.



It generates an `xml` file in your public folder on build. To see the results please `gatsby build && gatsby serve`.

### How to host mp3s locally

To host mp3s locally, drop them in the `./static` folder of your site and reference their local path in the url frontmatter like so:

```
url: local/path/to/files.mp3
```

And enable that option in your `gatsby-node.js` file:

```
module.exports = {
    plugins: [
        {
            resolve: `gatsby-plugin-podcast-feed`,
            options: {
                feedOptions,
                isContentLocal: true
            },
        }
    ]
}
```

For this to work correctly, you also have to have the `site_url` property specified in your `feedOptions`.
