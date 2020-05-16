function getLabel(value) {
  const words = value.split(/-|\.jpg$/);
  const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1);
  return words.slice(1).map(cap).join(" ");
}

export const STYLE_LIST = [
  { value: "1-neoclassicism.jpg", label: "" },
  { value: "2-romanticism.jpg", label: "" },
  { value: "3-hudson-river-school.jpg", label: "" },
  { value: "4-realist-school.jpg", label: "" },
  { value: "5-barbizon-school.jpg", label: "" },
  { value: "6-impressionism.jpg", label: "" },
  { value: "7-post-impressionism.jpg", label: "" },
  { value: "8-expressionism.jpg", label: "" },
  { value: "9-der-blaue-reiter.jpg", label: "" },
  { value: "10-picasso-rose-period.jpg", label: "" },
  { value: "11-fauvism.jpg", label: "" },
  { value: "12-proto-cubism.jpg", label: "" },
  { value: "13-analytic-cubism.jpg", label: "" },
  { value: "14-supermatism.jpg", label: "" },
  { value: "15-crystal-cubism.jpg", label: "" },
].map((item) => ({ ...item, label: getLabel(item.value) }));

export const DEFAULT_STYLE = "7-post-impressionism.jpg"

export const QUALITY_LIST = [
  { value: 100, label: "Fastest (100 iterations)" },
  { value: 200, label: "Faster (200 iterations)" },
  { value: 400, label: "Normal (400 iterations)" },
  { value: 800, label: "Better (800 iterations)" },
  { value: 1600, label: "Best (1600 iterations)" },
];

export const DEFAULT_QUALITY = 100;
