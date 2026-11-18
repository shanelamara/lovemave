export const mugs = [
  [7344, "Pink Bunny", "a pink bunny-eared character and a peach handle"],
  [7347, "Green Character", "a green-hooded character and a peach handle"],
  [7348, "Blue Character", "a character in a blue hood with yellow pigtails"],
  [7355, "Le is che", "black ?Le is che? lettering and a rounded handle"],
  [7357, "What Da Hell", "black handwritten ?When life give you What da hell? lettering"],
  [7359, "What the Shibal", "yellow ?What the Shibal? lettering and a mint wavy handle"],
  [7368, "What If Mag Cry AQ?", "pink ?What if MAG CRY AQ?? lettering and a pink handle"],
  [7370, "Tanginas", "black ?When life give you Tanginas? lettering"],
  [7372, "Esmiringhoy", "dark green ?Esmiringhoy? lettering and a mint wavy handle"],
  [7374, "Depota", "yellow ?Depota.? lettering and a white handle"],
].map(([id, name, detail]) => ({
  name,
  image: `collection/${id}.webp`,
  alt: `White ceramic mug with ${detail} against a red backdrop`,
  description: `White ceramic mug with ${detail}.`,
}));
