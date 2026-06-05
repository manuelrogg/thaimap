// No gym open → the panel slot renders nothing. Required so hard navigations to
// /city/[slug] (and the gym canonical page) don't 404 on the unmatched slot.
export default function PanelDefault() {
  return null;
}
