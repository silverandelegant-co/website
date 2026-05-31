const earrings = require('./earrings.json');
const rings = require('./rings.json');
const necklaces = require('./necklaces.json');
const bracelets = require('./bracelets.json');

const allPieces = [
  ...(earrings.pieces || []),
  ...(rings.pieces || []),
  ...(necklaces.pieces || []),
  ...(bracelets.pieces || [])
];

module.exports = {
  pieces: allPieces,
  detailedPieces: allPieces.filter(p => !p.no_detail)
};
