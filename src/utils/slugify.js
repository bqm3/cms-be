function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Normalize to decompose characters (e.g., "á" -> "a" + "´")
    .replace(/[\u0300-\u036f]/g, '') // Remove combining diacritical marks
    .replace(/[đĐ]/g, 'd')
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

module.exports = slugify;
