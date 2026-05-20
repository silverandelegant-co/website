const philosophy = require('./posts_philosophy.json');
const craftsmanship = require('./posts_craftsmanship.json');
const press = require('./posts_press.json');
const exhibitions = require('./posts_exhibitions.json');

module.exports = {
  posts: [
    ...(philosophy.posts || []),
    ...(craftsmanship.posts || []),
    ...(press.posts || []),
    ...(exhibitions.posts || [])
  ]
};
