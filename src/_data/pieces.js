const earrings = require('./earrings.json');
const rings = require('./rings.json');
const necklaces = require('./necklaces.json');
const bracelets = require('./bracelets.json');

module.exports = {
  pieces: [
    ...(earrings.pieces || []),
    ...(rings.pieces || []),
    ...(necklaces.pieces || []),
    ...(bracelets.pieces || [])
  ]
};
